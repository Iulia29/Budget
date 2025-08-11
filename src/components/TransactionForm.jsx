import { useState } from "react";
import { useTransactions } from "../context/TransactionContext";

const categories = ["Salariu", "Mâncare", "Transport", "Divertisment", "Altele"];

export default function TransactionForm() {
  const { addTransaction } = useTransactions();

  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [type, setType] = useState("venit"); // "venit" sau "cheltuială"
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!desc.trim() || isNaN(amount) || parseFloat(amount) === 0) {
      setError("Completează toate câmpurile corect (suma ≠ 0)!");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      desc: desc.trim(),
      amount: type === "cheltuială" ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount)),
      category,
    };

    addTransaction(newTransaction);
    setDesc("");
    setAmount("");
    setCategory(categories[0]);
    setType("venit");
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="form space-y-4">
      <input
        className="input"
        type="text"
        placeholder="Descriere"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        autoFocus
      />
      <input
        className="input"
        type="number"
        placeholder="Sumă"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <select
        className="input"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="venit">Venit</option>
        <option value="cheltuială">Cheltuială</option>
      </select>
      <select
        className="input"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {categories.map((cat) => (
          <option key={cat}>{cat}</option>
        ))}
      </select>
      <button type="submit" className="btn">Adaugă</button>
      {error && <div className="error text-red-500">{error}</div>}
    </form>
  );
}

