/**
 * Calendar expense table component
 */

import React, { useState } from "react";
import { Expense, ExpenseFormData } from "../types";
import { formatCurrency, formatDate } from "../utils/expenseUtils";
import { getCategoryEmoji } from "../constants/categoryEmojis";
import { COLORS } from "../constants/colors";
import { Button, Modal, Pagination } from "../vibes";
import { ExpenseForm } from "./ExpenseForm.tsx";
import { deleteExpense, updateExpense } from "../services/api";

interface CalendarExpenseTableProps {
  expenses: Expense[];
  onExpenseUpdated: () => void;
}

const ITEMS_PER_PAGE = 10;

export function CalendarExpenseTable({
  expenses,
  onExpenseUpdated,
}: CalendarExpenseTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const categories = Array.from(new Set(expenses.map((e) => e.category))).filter(
    Boolean,
  );

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      !categoryFilter || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentExpenses = filteredExpenses.slice(startIndex, endIndex);

  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) return;
    const headers = ["ID", "Date", "Description", "Category", "Amount"];
    const rows = filteredExpenses.map((e) => [
      e.id,
      e.date,
      `"${e.description.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      e.amount,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported transactions to CSV");
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    setDeletingExpense(expense);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingExpense) return;
    try {
      await deleteExpense(deletingExpense.id);
      setIsDeleteModalOpen(false);
      setDeletingExpense(null);
      onExpenseUpdated();
      showToast("Expense deleted successfully");
    } catch (error) {
      console.error("Failed to delete expense:", error);
      showToast("Failed to delete expense");
    }
  };

  const handleUpdate = async (data: ExpenseFormData) => {
    if (!editingExpense) return;
    try {
      await updateExpense(editingExpense.id, data);
      setIsEditModalOpen(false);
      setEditingExpense(null);
      onExpenseUpdated();
      showToast("Expense updated successfully");
    } catch (error) {
      console.error("Failed to update expense:", error);
      throw error;
    }
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: COLORS.background.main,
    borderRadius: "0.5rem",
    overflow: "hidden",
    border: `1px solid ${COLORS.border}`,
  };

  const theadStyle: React.CSSProperties = {
    backgroundColor: COLORS.background.card,
  };

  const thStyle: React.CSSProperties = {
    padding: "0.75rem",
    textAlign: "left",
    fontWeight: 600,
    color: COLORS.text.primary,
    borderBottom: `2px solid ${COLORS.border}`,
  };

  const tdStyle: React.CSSProperties = {
    padding: "0.75rem",
    borderBottom: `1px solid ${COLORS.border}`,
    color: COLORS.text.primary,
  };

  const emptyStyle: React.CSSProperties = {
    padding: "2rem",
    textAlign: "center",
    color: COLORS.text.secondary,
  };

  const actionButtonsStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
  };

  if (expenses.length === 0) {
    return (
      <div style={tableStyle}>
        <div style={emptyStyle}>
          No expenses found. Add your first expense to get started!
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: "240px" }}>
          <input
            type="text"
            placeholder="Search description..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: `1px solid ${COLORS.border}`,
              background: COLORS.background.main,
              color: COLORS.text.primary,
              fontSize: "14px",
              flex: 1,
              maxWidth: "320px",
              outline: "none",
            }}
          />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: `1px solid ${COLORS.border}`,
              background: COLORS.background.main,
              color: COLORS.text.primary,
              fontSize: "14px",
              outline: "none",
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="secondary"
          size="small"
          onClick={handleExportCSV}
          disabled={filteredExpenses.length === 0}
        >
          Export CSV
        </Button>
      </div>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead style={theadStyle}>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Amount</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentExpenses.length === 0 ? (
              <tr>
                <td colSpan={5} style={emptyStyle}>
                  No matching expenses found.
                </td>
              </tr>
            ) : (
              currentExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td style={tdStyle}>{formatDate(new Date(expense.date))}</td>
                  <td style={tdStyle}>{expense.description}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span>{getCategoryEmoji(expense.category)}</span>
                      <span>{expense.category}</span>
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "left", fontWeight: 600 }}>
                    {formatCurrency(expense.amount)}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <div style={actionButtonsStyle}>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handleEdit(expense)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => handleDelete(expense)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingExpense(null);
        }}
        title="Edit Expense"
      >
        {editingExpense && (
          <ExpenseForm
            initialData={{
              amount: editingExpense.amount.toString(),
              description: editingExpense.description,
              category: editingExpense.category,
              date: formatDate(new Date(editingExpense.date)),
            }}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              setEditingExpense(null);
            }}
            submitLabel="Update Expense"
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingExpense(null);
        }}
        title="Delete Expense"
      >
        <div style={{ padding: "1rem 0" }}>
          <p style={{ marginBottom: "1.5rem", color: COLORS.text.primary }}>
            Are you sure you want to delete this expense?
          </p>
          {deletingExpense && (
            <p style={{ marginBottom: "1.5rem", color: COLORS.text.secondary }}>
              <strong>{deletingExpense.description}</strong> -{" "}
              {formatCurrency(deletingExpense.amount)}
            </p>
          )}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingExpense(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: COLORS.secondary.s10,
            color: "white",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            zIndex: 1000,
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          {toastMessage}
        </div>
      )}
    </>
  );
}
