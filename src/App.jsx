import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Pagina404 from "./pages/Pagina404";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Pagina404 />} />
      </Routes>
    </HashRouter>
  );
}

export default App;


const defaultCategories = [
  "Salary",
  "Food",
  "Transport",
  "Entertainment",
  "Others",
];

// Matte colors: gray, light blue, white
const COLORS = [
  "#6B7280", // matte gray
  "#2563EB", // matte light blue
  "#374151", // dark gray
  "#9CA3AF", // light gray
  "#F3F4F6", // matte white
];

export default function App() {
  // --- State ---
  const [transactions, setTransactions] = useState([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(defaultCategories[0]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Categorii personalizate (începe cu cele default)
  const [categories, setCategories] = useState(defaultCategories);

  // Pentru gestionarea adăugării/editerii categoriei
  const [newCatName, setNewCatName] = useState("");
  const [catEditingId, setCatEditingId] = useState(null);

  // Buget per categorie
  // Obiect cu chei categoria și valoare buget
  const [budgets, setBudgets] = useState({});

  // --- Funcții pentru tranzacții ---

  function addTransaction(e) {
    e.preventDefault();
    if (!desc || !amount || isNaN(amount)) {
      alert("Please fill out the form correctly!");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isEditing) {
      setTransactions(
        transactions.map((t) =>
          t.id === editId ? { ...t, desc, amount: parsedAmount, category, date: t.date || new Date().toISOString().slice(0, 10) } : t
        )
      );
      setIsEditing(false);
      setEditId(null);
    } else {
      const newTrans = {
        id: Date.now(),
        desc,
        amount: parsedAmount,
        category,
        date: new Date().toISOString().slice(0, 10), // default azi
      };
      setTransactions([newTrans, ...transactions]);
    }
    setDesc("");
    setAmount("");
    setCategory(categories[0]);
  }

  // Șterge o tranzacție
  function deleteTransaction(id) {
    if (window.confirm("Delete this transaction?")) {
      setTransactions(transactions.filter((t) => t.id !== id));
    }
  }

  // Editare tranzacție (setez în form)
  function handleEdit(t) {
    setDesc(t.desc);
    setAmount(t.amount.toString());
    setCategory(t.category);
    setIsEditing(true);
    setEditId(t.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // --- Funcții pentru categorii ---

  function addCategory(e) {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return alert("Category name cannot be empty");
    if (categories.includes(trimmed)) return alert("Category already exists");
    setCategories([...categories, trimmed]);
    setNewCatName("");
  }

  function startEditCategory(cat) {
    setCatEditingId(cat);
    setNewCatName(cat);
  }

  function saveCategoryEdit() {
    const trimmed = newCatName.trim();
    if (!trimmed) return alert("Category name cannot be empty");
    if (categories.includes(trimmed) && trimmed !== catEditingId)
      return alert("Category already exists");
    setCategories(
      categories.map((c) => (c === catEditingId ? trimmed : c))
    );

    // Actualizez categoria în tranzacții
    setTransactions(
      transactions.map((t) =>
        t.category === catEditingId ? { ...t, category: trimmed } : t
      )
    );

    // Actualizez și bugetele
    if (budgets[catEditingId]) {
      setBudgets((b) => {
        const newBudgets = { ...b };
        newBudgets[trimmed] = newBudgets[catEditingId];
        delete newBudgets[catEditingId];
        return newBudgets;
      });
    }

    setCatEditingId(null);
    setNewCatName("");
  }

  function cancelCategoryEdit() {
    setCatEditingId(null);
    setNewCatName("");
  }

  function deleteCategory(cat) {
    if (window.confirm(`Delete category "${cat}" and its transactions?`)) {
      setCategories(categories.filter((c) => c !== cat));
      setTransactions(transactions.filter((t) => t.category !== cat));
      setBudgets((b) => {
        const newBudgets = { ...b };
        delete newBudgets[cat];
        return newBudgets;
      });
      if (filterCategory === cat) setFilterCategory("All");
    }
  }

  // --- Funcții pentru filtrare după dată și categorie ---

  // Filtrez după categorie și dată (startDate și endDate)
  const filtered = transactions.filter((t) => {
    const matchCat = filterCategory === "All" || t.category === filterCategory;
    const tDate = new Date(t.date);
    const matchStart = startDate ? tDate >= new Date(startDate) : true;
    const matchEnd = endDate ? tDate <= new Date(endDate) : true;
    return matchCat && matchStart && matchEnd;
  });

  // --- Calcul sumă venituri/cheltuieli ---

  const income = filtered
    .filter((t) => t.amount > 0)
    .reduce((acc, cur) => acc + cur.amount, 0);

  const expenses = filtered
    .filter((t) => t.amount < 0)
    .reduce((acc, cur) => acc + cur.amount, 0);

  // --- Date pentru PieChart ---

  const dataPie = categories.map((cat, idx) => {
    // suma absolută a tranzacțiilor din categoria respectivă, filtrate după interval dată
    const val = filtered
      .filter((t) => t.category === cat)
      .reduce((a, b) => a + Math.abs(b.amount), 0);
    return {
      name: cat,
      value: val,
    };
  });

  // --- Buget pe categorii și consum ---

  // Suma cheltuielilor absolute per categorie, filtrate după dată (doar cheltuieli)
  const spentPerCategory = {};
  categories.forEach((cat) => {
    spentPerCategory[cat] = filtered
      .filter((t) => t.category === cat && t.amount < 0)
      .reduce((acc, cur) => acc + Math.abs(cur.amount), 0);
  });

  // --- Funcție setare buget ---
  function setBudget(cat, value) {
    const valNum = parseFloat(value);
    if (isNaN(valNum) || valNum < 0) {
      alert("Budget must be a positive number");
      return;
    }
    setBudgets((b) => ({ ...b, [cat]: valNum }));
  }

  // --- Ștergere toate tranzacțiile ---
  function clearAll() {
    if (window.confirm("Delete all transactions?")) {
      setTransactions([]);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6 flex flex-col items-center font-poppins text-gray-100">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold mb-2 tracking-wide">
          Budget <span className="text-blue-600">WOW</span>
        </h1>
        <p className="text-lg italic text-gray-400">
          Keep your finances under control with style!
        </p>
      </header>

      {/* FORM TRANZACȚII */}
      <form
        onSubmit={addTransaction}
        className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full mb-10 flex flex-col md:flex-row gap-5 shadow-lg"
      >
        <input
          type="text"
          placeholder="Transaction description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="flex-[3] rounded-lg px-4 py-3 bg-gray-700 border border-transparent focus:outline-none focus:border-blue-600 placeholder-gray-400 text-gray-100 transition"
          required
        />
        <input
          type="number"
          placeholder="Amount (+ income, - expense)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 rounded-lg px-4 py-3 bg-gray-700 border border-transparent focus:outline-none focus:border-blue-600 placeholder-gray-400 text-gray-100 transition"
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex-1 rounded-lg px-4 py-3 bg-gray-700 border border-transparent focus:outline-none focus:border-blue-600 text-gray-100 transition"
        >
          {categories.map((c) => (
            <option key={c} value={c} className="text-gray-900">
              {c}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-gray-100 text-lg transition shadow-lg"
        >
          {isEditing ? "Save" : "Add"}
        </button>
      </form>

      {/* FILTRE */}
      <div className="max-w-4xl w-full flex flex-wrap justify-center gap-4 mb-8">
        {/* Filtru categorie */}
        {["All", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-5 py-2 rounded-full font-semibold transition shadow-lg ${
              filterCategory === cat
                ? "bg-blue-600 text-gray-100 scale-110"
                : "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
        {/* Filtru interval dată */}
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-lg px-4 py-2 bg-gray-700 border border-transparent focus:outline-none focus:border-blue-600 text-gray-100"
          placeholder="Start date"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-lg px-4 py-2 bg-gray-700 border border-transparent focus:outline-none focus:border-blue-600 text-gray-100"
          placeholder="End date"
        />
      </div>

      {/* SUMMARY */}
      <div className="max-w-4xl w-full flex flex-col md:flex-row gap-10 mb-10">
        <section className="flex-1 bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-blue-600">Summary</h2>
          <div className="flex justify-around text-center text-gray-100">
            <div>
              <h3 className="text-lg font-semibold">Income</h3>
              <p className="text-green-400 text-3xl font-extrabold">
                {income.toFixed(2)} USD
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Expenses</h3>
              <p className="text-red-400 text-3xl font-extrabold">
                {expenses.toFixed(2)} USD
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Balance</h3>
              <p
                className={`text-3xl font-extrabold ${
                  income + expenses >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {(income + expenses).toFixed(2)} USD
              </p>
            </div>
          </div>

          <button
            onClick={clearAll}
            className="mt-8 w-full py-3 bg-red-700 rounded-lg font-bold hover:bg-red-800 transition shadow-lg"
          >
            Delete all transactions
          </button>
        </section>

        {/* PIE CHART */}
        <section className="flex-1 bg-gray-800 rounded-xl p-6 shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-6 text-blue-600">
            Category Chart
          </h2>
          <PieChart width={320} height={320}>
            <Pie
              data={dataPie}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={{ fill: "white", fontWeight: "bold" }}
              isAnimationActive={true}
              animationDuration={800}
            >
              {dataPie.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "rgba(243,244,246,0.9)", color: "#000" }}
            />
            <Legend
              wrapperStyle={{ color: "#d1d5db", marginTop: 20 }}
              layout="horizontal"
              verticalAlign="bottom"
              height={36}
            />
          </PieChart>
        </section>
      </div>

      {/* TRANZACȚII FILTRATE */}
      <section className="max-w-4xl w-full mt-4 bg-gray-800 rounded-xl p-6 shadow-lg overflow-y-auto max-h-[400px]">
        <h2 className="text-2xl font-bold mb-4 text-blue-600 text-center">
          Transactions
        </h2>
        {filtered.length === 0 && (
          <p className="text-gray-400 text-center italic">
            No transactions in this filter.
          </p>
        )}
        <ul className="divide-y divide-gray-700">
          {filtered.map((t) => (
            <li
              key={t.id}
              className="cursor-pointer flex justify-between p-3 hover:bg-gray-700 rounded transition transform hover:scale-[1.02]"
              title="Click to edit transaction"
            >
              <div>
                <p className="font-semibold text-lg">{t.desc}</p>
                <p className="text-gray-400 italic text-sm">{t.category}</p>
                <p className="text-gray-400 italic text-xs">{t.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`font-bold text-lg ${
                    t.amount > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {t.amount.toFixed(2)} USD
                </div>
                <button
                  onClick={() => handleEdit(t)}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-gray-100 font-semibold shadow"
                  title="Edit transaction"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteTransaction(t.id)}
                  className="bg-red-700 hover:bg-red-800 px-3 py-1 rounded text-gray-100 font-semibold shadow"
                  title="Delete transaction"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* CATEGORII */}
      <section className="max-w-4xl w-full mt-12 bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-600 text-center">
          Manage Categories
        </h2>
        <form onSubmit={addCategory} className="flex gap-4 mb-6">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="New category name"
            className="flex-1 rounded-lg px-4 py-3 bg-gray-700 border border-transparent focus:outline-none focus:border-blue-600 placeholder-gray-400 text-gray-100 transition"
          />
          {catEditingId ? (
            <>
              <button
                type="button"
                onClick={saveCategoryEdit}
                className="bg-blue-600 hover:bg-blue-700 text-gray-100 font-bold px-6 py-3 rounded transition shadow-lg"
              >
                Save
              </button>
              <button
                type="button"
                onClick={cancelCategoryEdit}
                className="bg-gray-600 hover:bg-gray-700 text-gray-100 font-bold px-6 py-3 rounded transition shadow-lg"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-gray-100 font-bold px-6 py-3 rounded transition shadow-lg"
            >
              Add
            </button>
          )}
        </form>

        <ul className="divide-y divide-gray-700 max-h-[250px] overflow-y-auto">
          {categories.map((cat, idx) => (
            <li
              key={cat}
              className="flex justify-between items-center py-3 px-4 hover:bg-gray-700 rounded transition cursor-default"
            >
              <div className="flex items-center gap-6">
                <span className="font-semibold text-lg">{cat}</span>

                {/* Buget input */}
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Set budget"
                  value={budgets[cat] ?? ""}
                  onChange={(e) => setBudget(cat, e.target.value)}
                  className="w-24 rounded-lg px-3 py-1 text-gray-900 font-semibold focus:outline-none"
                  title="Set budget for category"
                />

                {/* Afisare cheltuieli / buget */}
                <div
                  className={`font-semibold ${
                    budgets[cat] && spentPerCategory[cat] > budgets[cat]
                      ? "text-red-500"
                      : "text-green-400"
                  }`}
                  title="Spent / Budget"
                >
                  {spentPerCategory[cat].toFixed(2)} /{" "}
                  {budgets[cat] ? budgets[cat].toFixed(2) : "0.00"} USD
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => startEditCategory(cat)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-gray-100 font-semibold shadow"
                  title="Edit category name"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteCategory(cat)}
                  className="bg-red-700 hover:bg-red-800 px-4 py-1 rounded text-gray-100 font-semibold shadow"
                  title="Delete category and related transactions"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}



