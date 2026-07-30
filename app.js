const STORAGE_KEY = "is2-loans-v1";

const equipmentCatalog = [
  { id: "EQ-01", name: "Laptop Lenovo", category: "Cómputo" },
  { id: "EQ-02", name: "Laptop HP", category: "Cómputo" },
  { id: "EQ-03", name: "Proyector Epson", category: "Audiovisual" },
  { id: "EQ-04", name: "Cámara Canon", category: "Audiovisual" },
  { id: "EQ-05", name: "Tablet Samsung", category: "Cómputo" },
  { id: "EQ-06", name: "Micrófono inalámbrico", category: "Audiovisual" },
  { id: "EQ-07", name: "Router TP-Link", category: "Redes" },
  { id: "EQ-08", name: "Kit Arduino", category: "Laboratorio" }
];

const form = document.querySelector("#loanForm");
const equipmentSelect = document.querySelector("#equipment");
const borrowerInput = document.querySelector("#borrower");
const loanDateInput = document.querySelector("#loanDate");
const returnDateInput = document.querySelector("#returnDate");
const formMessage = document.querySelector("#formMessage");
const loanList = document.querySelector("#loanList");
const emptyState = document.querySelector("#emptyState");
const activeCount = document.querySelector("#activeCount");
const listMessage = document.querySelector("#listMessage");

// Elementos del modal de confirmación de cancelación (mejora Ficha 24)
const cancelModal = document.querySelector("#cancelModal");
const cancelModalDetails = document.querySelector("#cancelModalDetails");
const cancelModalConfirm = document.querySelector("#cancelModalConfirm");
const cancelModalDismiss = document.querySelector("#cancelModalDismiss");
let pendingCancelId = null;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function loadLoans() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLoans(loans) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
}

function activeEquipmentIds(loans) {
  return new Set(loans.filter((loan) => loan.status === "Activo").map((loan) => loan.equipmentId));
}

function renderEquipmentOptions() {
  const current = equipmentSelect.value;
  const busy = activeEquipmentIds(loadLoans());
  equipmentSelect.innerHTML = '<option value="">Seleccione un equipo</option>';
  equipmentCatalog.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.name} (${item.category})${busy.has(item.id) ? " — no disponible" : ""}`;
    option.disabled = busy.has(item.id);
    equipmentSelect.append(option);
  });
  equipmentSelect.value = current;
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(`${dateValue}T00:00:00`));
}

function statusClassFor(status) {
  if (status === "Activo") return "status-active";
  if (status === "Cancelado") return "status-cancelled";
  return "status-returned";
}

function renderLoans() {
  const loans = loadLoans();
  loanList.innerHTML = "";
  loans.forEach((loan) => {
    const row = document.createElement("tr");
    const isActive = loan.status === "Activo";
    row.innerHTML = `
      <td>${loan.equipmentName}</td>
      <td>${loan.borrower}</td>
      <td>${formatDate(loan.loanDate)}</td>
      <td>${formatDate(loan.returnDate)}</td>
      <td><span class="status ${statusClassFor(loan.status)}">${loan.status}</span></td>
      <td class="actions-cell">${
        isActive
          ? `<button type="button" class="return-btn" data-id="${loan.id}">Registrar devolución</button>
             <button type="button" class="cancel-btn" data-id="${loan.id}">Cancelar préstamo</button>`
          : "—"
      }</td>`;
    loanList.append(row);
  });
  const active = loans.filter((loan) => loan.status === "Activo").length;
  activeCount.textContent = `${active} activo${active === 1 ? "" : "s"}`;
  emptyState.hidden = loans.length !== 0;
  renderEquipmentOptions();
}

function showMessage(message) {
  formMessage.textContent = message;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const equipment = equipmentCatalog.find((item) => item.id === equipmentSelect.value);
  const borrower = borrowerInput.value.trim();
  const loanDate = loanDateInput.value;
  const returnDate = returnDateInput.value;

  if (!equipment || !borrower || !loanDate || !returnDate) {
    showMessage("Complete todos los campos para registrar el préstamo.");
    return;
  }
  if (returnDate < loanDate) {
    showMessage("La fecha de devolución no puede ser anterior a la fecha de préstamo.");
    return;
  }
  if (activeEquipmentIds(loadLoans()).has(equipment.id)) {
    showMessage("El equipo seleccionado no está disponible.");
    return;
  }

  const loans = loadLoans();
  loans.unshift({
    id: crypto.randomUUID(),
    equipmentId: equipment.id,
    equipmentName: equipment.name,
    borrower,
    loanDate,
    returnDate,
    status: "Activo"
  });
  saveLoans(loans);
  form.reset();
  loanDateInput.value = todayISO();
  returnDateInput.value = todayISO();
  showMessage("");
  if (listMessage) listMessage.textContent = "";
  renderLoans();
});

loanList.addEventListener("click", (event) => {
  const returnButton = event.target.closest(".return-btn");
  if (returnButton) {
    const loans = loadLoans().map((loan) => loan.id === returnButton.dataset.id ? { ...loan, status: "Devuelto" } : loan);
    saveLoans(loans);
    if (listMessage) listMessage.textContent = "";
    renderLoans();
    return;
  }

  const cancelButton = event.target.closest(".cancel-btn");
  if (cancelButton) {
    const loan = loadLoans().find((item) => item.id === cancelButton.dataset.id);
    if (loan) openCancelModal(loan);
  }
});

// --- Mejora Ficha 24: cancelación de préstamo con confirmación ---
function openCancelModal(loan) {
  pendingCancelId = loan.id;
  cancelModalDetails.textContent = `${loan.equipmentName} — ${loan.borrower}`;
  cancelModal.hidden = false;
  cancelModalConfirm.focus();
}

function closeCancelModal() {
  cancelModal.hidden = true;
  pendingCancelId = null;
}

cancelModalDismiss.addEventListener("click", () => {
  // Cancelar la acción del modal: no se modifica ningún registro (CP-02).
  closeCancelModal();
});

cancelModal.addEventListener("click", (event) => {
  if (event.target === cancelModal) closeCancelModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !cancelModal.hidden) closeCancelModal();
});

cancelModalConfirm.addEventListener("click", () => {
  // Confirmar la cancelación: cambia el estado a "Cancelado" y libera el equipo (CP-01).
  if (!pendingCancelId) return;
  const loans = loadLoans().map((loan) =>
    loan.id === pendingCancelId ? { ...loan, status: "Cancelado" } : loan
  );
  saveLoans(loans);
  const cancelled = loans.find((loan) => loan.id === pendingCancelId);
  closeCancelModal();
  renderLoans();
  if (listMessage && cancelled) {
    listMessage.textContent = `Préstamo de "${cancelled.equipmentName}" — ${cancelled.borrower} cancelado. El equipo está disponible nuevamente.`;
  }
});

document.querySelector("#resetDemoBtn").addEventListener("click", () => {
  if (confirm("¿Desea eliminar todos los préstamos guardados en este navegador?")) {
    localStorage.removeItem(STORAGE_KEY);
    showMessage("");
    if (listMessage) listMessage.textContent = "";
    renderLoans();
  }
});

loanDateInput.value = todayISO();
returnDateInput.value = todayISO();
renderLoans();
