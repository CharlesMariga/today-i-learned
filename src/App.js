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
  const [currentCategory, setCurrentCategory] = useState("all");

  useEffect(() => {
    async function getFacts() {
      setIsLoading(true);

      let query = supabase.from("facts").select();

      if (currentCategory !== "all") query.eq("category", currentCategory);

      query = query.order("votesInteresting", { ascending: false }).limit(1000);

      const { data: facts, error } = await query;

      if (!error) setFacts(facts);
      else alert("There was a problem getting data!");

      setIsLoading(false);
    }
    getFacts();
  }, [currentCategory]);

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
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {isLoading ? (
          <Loader />
        ) : (
          <FactList setFacts={setFacts} facts={facts} />
        )}
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
  const [isUploading, setIsuploading] = useState(false);
  const maxTextLength = 200;

  async function handleSubmit(e) {
    // 1. Prevent the browser reload
    e.preventDefault();

    // 2. Check if the data is valid. If so, create a new fact
    if (text && isValidHttpUrl(source) && category) {
      // 3. Create a new fact object
      setIsuploading(true);
      const { data: newFact, error } = await supabase
        .from("facts")
        .insert([{ text, source, category }])
        .select();
      setIsuploading(false);

      // 4. Add the new fact to the UI: Addd the fact to state
      if (!error) setFacts((facts) => [newFact[0], ...facts]);

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
        disabled={isUploading}
      />
      <span>{maxTextLength - text.length}</span>
      <input
        type="text"
        value={source}
        placeholder="Trustworthy source..."
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option value="">Choose category:</option>
        {CATEGORIES.map((category) => (
          <option key={category.name} value={category.name}>
            {category.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button disabled={isUploading} className="btn btn-large">
        Post
      </button>
    </form>
  );
}

function CategoryFilter({ setCurrentCategory }) {
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
              onClick={() => setCurrentCategory(category.name)}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FactList({ facts, setFacts }) {
  if (!facts.length)
    return (
      <p className="message">
        No facts for this category yet! Create the frist one ✌️
      </p>
    );

  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact setFacts={setFacts} key={fact.id} fact={fact} />
        ))}
      </ul>
      <p>Ther are {facts.length} facts in the database. Add you own! </p>
    </section>
  );
}

function Fact({ fact, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed =
    fact.votesInteresting + fact.votesMindblowing < fact.votesFalse;

  async function handleVote(columnName) {
    setIsUpdating(true);
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ [columnName]: fact[columnName] + 1 })
      .eq("id", fact.id)
      .select();
    setIsUpdating(false);

    if (!error)
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
      );
  }

  return (
    <li className="fact">
      <p>
        {isDisputed ? <span className="disputed">[DISPUTED]</span> : null}
        {fact.text}
        <a
          className="source"
          href={fact.source}
          rel="noreferrer"
          target="_blank"
        >
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
        <button
          disabled={isUpdating}
          onClick={() => handleVote("votesInteresting")}
        >
          👍️ {fact.votesInteresting}
        </button>
        <button onClick={() => handleVote("votesMindblowing")}>
          🤯️ {fact.votesMindblowing}
        </button>
        <button onClick={() => handleVote("votesFalse")}>
          ⛔️ {fact.votesFalse}
        </button>
      </div>
    </li>
  );
}

export default App;
