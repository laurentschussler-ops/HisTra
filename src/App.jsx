import { useEffect, useState } from "react";

function getRatingColor(rating) {
  switch (rating) {
    case 0:
      return "#4CAF50"; // Grün

    case 1:
      return "#FFC107"; // Gelb

    case 2:
      return "#FF9800"; // Orange

    case 3:
      return "#F44336"; // Rot

    case 9:
      return "#9E9E9E"; // Grau

    default:
      return "#FFFFFF";
  }
}

function App() {
  const [foods, setFoods] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [exactMatch, setExactMatch] = useState(false);

  useEffect(() => {
    fetch("/FoodList_clean_v2.json")
      .then((response) => response.json())
      .then((data) => {
        setFoods(data);
        console.log("Geladene Datensätze:", data.length);
      })
      .catch((error) => console.error(error));
  }, []);

  const filteredFoods = foods
  .filter((food) => {
    const search = searchText.toLowerCase();

    if (!search) return true;

    const names = [
      food.name,
      ...(food.synonyms || []),
    ].map((entry) => entry.toLowerCase());

    if (exactMatch) {
      return names.some(
        (entry) => entry === search
      );
    }

    return names.some(
      (entry) => entry.includes(search)
    );
  })
  .sort((a, b) =>
    a.name.localeCompare(b.name, "de", {
      sensitivity: "base",
    })
  );

  const groupedFoods = filteredFoods.reduce(
    (groups, food) => {
      const letter = food.name
        .charAt(0)
        .toUpperCase();

      if (!groups[letter]) {
        groups[letter] = [];
      }

      groups[letter].push(food);

      return groups;
    },
    {}
  );


  return (
    <div style={{ padding: "20px" }}>
      <h1>Lebensmittelcheck</h1>

      <input
        type="text"
        placeholder="Lebensmittel suchen..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{
          width: "300px",
          padding: "8px",
          marginBottom: "20px",
        }}
      />

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "20px",
      }}
    >
      <span>
        {exactMatch
          ? "Exakte Suche"
          : "Enthält Suchbegriff"}
      </span>

      <label
        style={{
          position: "relative",
          display: "inline-block",
          width: "50px",
          height: "26px",
        }}
      >
        <input
          type="checkbox"
          checked={exactMatch}
          onChange={(e) =>
            setExactMatch(e.target.checked)
          }
          style={{
            opacity: 0,
            width: 0,
            height: 0,
          }}
        />

        <span
          style={{
            position: "absolute",
            cursor: "pointer",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: exactMatch
              ? "#4CAF50"
              : "#ccc",
            borderRadius: "26px",
            transition: "0.3s",
          }}
        >
          <span
            style={{
              position: "absolute",
              height: "20px",
              width: "20px",
              left: exactMatch ? "26px" : "3px",
              bottom: "3px",
              backgroundColor: "white",
              borderRadius: "50%",
              transition: "0.3s",
            }}
          />
        </span>
      </label>
    </div>

      <p>Treffer: {filteredFoods.length}</p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "20px",
          position: "sticky",
          top: 0,
          backgroundColor: "white",
          padding: "10px 0",
          zIndex: 100,
        }}
      >
        {Object.keys(groupedFoods).map((letter) => (
          <button
            key={letter}
            onClick={() =>
              document
                .getElementById(`letter-${letter}`)
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
            style={{
              border: "1px solid #ccc",
              borderRadius: "5px",
              background: "#f5f5f5",
              cursor: "pointer",
              padding: "5px 8px",
            }}
          >
            {letter}
          </button>
        ))}
      </div>

      {Object.keys(groupedFoods).map((letter) => (
        <div
          key={letter}
          id={`letter-${letter}`}
        >
          <h2
            style={{
              borderBottom: "2px solid #ccc",
              paddingBottom: "5px",
              marginTop: "30px",
            }}
          >
            {letter}
          </h2>

          {groupedFoods[letter].map((food) => (
            <div
              key={food.id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "5px",
              }}
            >
              <strong>{food.name}</strong>

              <br />

              <div
                style={{
                  backgroundColor: getRatingColor(food.rating),
                  color: "white",
                  display: "inline-block",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  marginTop: "5px",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Bewertung: {food.rating}
              </div>

              <br />

              H: {food.histamin ? "Ja" : "Nein"} | A:{" "}
              {food.amine ? "Ja" : "Nein"} | L:{" "}
              {food.liberator ? "Ja" : "Nein"} | B:{" "}
              {food.blocker ? "Ja" : "Nein"}

              {food.synonyms.length > 0 && (
                <>
                  <br />
                  Synonyme: {food.synonyms.join(", ")}
                </>
              )}

              {food.comment && (
                <>
                  <br />
                  <br />
                  <em>{food.comment}</em>
                </>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default App;