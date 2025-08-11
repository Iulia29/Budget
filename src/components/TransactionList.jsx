import { useTransactions } from "../context/TransactionContext";
import { useState } from "react";

const categories = ["Salariu", "Mâncare", "Transport", "Divertisment", "Altele"];

export default function TransactionList() {
  const { transactions, deleteTransaction } = useTransactions();
  const [filter, setFilter] = useState("Toate");

  const filtered = filter === "Toate"
    ? transactions
    : transactions.filter(t => t.category === filter);

  const income = filtered
    .filter(t => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const expenses = filtered
    .filter(t => t.amount < 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const total = income + expenses;

  return (
    <>
      <div className="summary grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-green-100 rounded">
          <h3 className="text-green-700 font-semibold">Venituri</h3>
          <p className="income text-xl">{income.toFixed(2)} lei</p>
        </div>
        <div className="p-4 bg-red-100 rounded">
          <h3 className="text-red-700 font-semibold">Cheltuieli</h3>
          <p className="expense text-xl">{expenses.toFixed(2)} lei</p>
        </div>
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="text-gray-800 font-semibold">Sold</h3>
          <p className={`text-xl font-bold ${total < 0 ? "text-red-600" : "text-green-600"}`}>
            {total.toFixed(2)} lei
          </p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-blue-900">
          Filtru după categorie:
        </label>
        <select
          className="input"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="Toate">Toate</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {transactions.length === 0 ? (
        <p className="text-gray-500 italic">Nu există tranzacții încă.</p>
      ) : (
        <ul className="transaction-list space-y-2">
          {filtered.length === 0 ? (
            <li className="empty text-gray-500 italic">
              Nu există tranzacții pentru această categorie.
            </li>
          ) : (
            filtered.map((t) => (
              <li
                key={t.id}
                className={`transaction-item flex justify-between items-center px-4 py-2 rounded ${
                  t.amount > 0 ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <div>
                  <p className="font-medium">{t.desc}</p>
                  <p className="text-sm text-gray-500">{t.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {t.amount > 0 ? "+" : ""}
                    {t.amount.toFixed(2)} lei
                  </span>
                  <button
                    className="delete-btn text-red-500 hover:text-red-700 text-xl font-bold"
                    onClick={() => deleteTransaction(t.id)}
                    title="Șterge"
                  >
                    &times;
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </>
  );
}

