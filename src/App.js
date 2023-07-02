import { useEffect, useState } from "react";
import supabase from "./supabase";
import "./style.css";

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getFacts() {
      setIsLoading(true);
      const { data: facts } = await supabase
        .from("facts")
        .select()
        .order("votesInteresting", { ascending: false })
        .limit(1000);

      if (!error) setFacts(facts);
      else alert("There was a problem getting data!");

      setIsLoading(false);
    }
    getFacts();
  }, []);

  return (
    <>
      {/* HEADER */}
      <Header
        showForm={showForm}
        setShowForm={() => setShowForm((val) => !val)}
      />

      {showForm ? (
        <NewFactForm setShowForm={setShowForm} setFacts={setFacts} />
      ) : null}

      <main className="main">
        <CategoryFilter />
        {isLoading ? <Loader /> : <FactList facts={facts} />}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

function Header({ showForm, setShowForm }) {
  return (
    <header className="header">
      <div className="logo">
        <img
          src="./logo.png"
          height="68"
          width="68"
          alt="Today I Learned Logo"
        />
        <h1>Today I learned</h1>
      </div>
      <button className="btn btn-large btn-open" onClick={setShowForm}>
        {showForm ? "Close" : "Share a fact"}
      </button>
    </header>
  );
}

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const maxTextLength = 200;

  function handleSubmit(e) {
    // 1. Prevent the browser reload
    e.preventDefault();
    console.log(text, source, category);

    // 2. Check if the data is valid. If so, create a new fact
    if (text && isValidHttpUrl(source) && category) {
      // 3. Create a new fact object
      const newFact = {
        id: Math.round(Math.random() * 1000000),
        text,
        source,
        category,
        votesMindblowing: 0,
        votesFalse: 0,
        createdIn: new Date().getFullYear(),
      };
      // 4. Add the new fact to the UI: Addd the fact to state
      setFacts((facts) => [newFact, ...facts]);

      // 5. Reset the input fields
      setText("");
      setSource("");
      setCategory("");

      // 6. Close the form
      setShowForm(false);
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        placeholder="Share a fact with the world..."
        onChange={(e) => setText(e.target.value)}
        maxLength={maxTextLength}
      />
      <span>{maxTextLength - text.length}</span>
      <input
        type="text"
        value={source}
        placeholder="Trustworthy source..."
        onChange={(e) => setSource(e.target.value)}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Choose category:</option>
        {CATEGORIES.map((category) => (
          <option key={category.name} value={category.name}>
            {category.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large">Post</button>
    </form>
  );
}

function CategoryFilter() {
  return (
    <aside>
      <ul>
        <li className="category">
          <button className="btn btn-all-categories">All</button>
        </li>
        {CATEGORIES.map((category) => (
          <li key={category.color} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FactList({ facts }) {
  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} />
        ))}
      </ul>
      <p>Ther are {facts.length} facts in the database. Add you own!</p>
    </section>
  );
}

function Fact({ fact }) {
  return (
    <li className="fact">
      <p>
        {fact.text}
        <a className="source" href={fact.source} target="_blank">
          (source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === fact.category)
            .color,
        }}
      >
        {fact.category}
      </span>
      <div className="vote-buttons">
        <button>👍️ {fact.votesInteresting}</button>
        <button>🤯️ {fact.votesMindblowing}</button>
        <button>⛔️ {fact.votesFalse}</button>
      </div>
    </li>
  );
}

export default App;
