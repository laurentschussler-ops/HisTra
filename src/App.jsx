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

function highlightText(text, searchText) {
    if (!searchText) return text;

    const regex = new RegExp(`(${searchText})`, "gi");

    return text
      .split(regex)
      .map((part, index) =>
        part.toLowerCase() ===
        searchText.toLowerCase() ? (
          <span
            key={index}
            style={{
              backgroundColor: "#87CEFA",
              padding: "0 2px",
              borderRadius: "3px",
            }}
          >
            {part}
          </span>
        ) : (
          part
        )
      );
  }

function App() {
  const [foods, setFoods] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [exactMatch, setExactMatch] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedRatings, setSelectedRatings] = useState([0, 1, 2, 3, 9,
  ]);
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] =
    useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}FoodList_clean_v2.json`)
      .then((response) => response.json())
      .then((data) => {
        setFoods(data);
        console.log("Geladene Datensätze:", data.length);
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    const savedFavorites =
      JSON.parse(
        localStorage.getItem("favorites")
      ) || [];

    setFavorites(savedFavorites);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "favorites",
      JSON.stringify(favorites)
    );
  }, [favorites]);

  useEffect(() => {
      const handleScroll = () => {
        setShowScrollTop(window.scrollY > 5);
      };

      window.addEventListener("scroll", handleScroll);

      return () => {
        window.removeEventListener(
          "scroll",
          handleScroll
        );
      };
    }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const toggleFavorite = (foodId) => {
    if (favorites.includes(foodId)) {
      setFavorites(
        favorites.filter(
          (id) => id !== foodId
        )
      );
    } else {
      setFavorites([
        ...favorites,
        foodId,
      ]);
    }
  };

  const toggleRating = (rating) => {
    if (selectedRatings.includes(rating)) {
      setSelectedRatings(
        selectedRatings.filter(
          (r) => r !== rating
        )
      );
    } else {
      setSelectedRatings([
        ...selectedRatings,
        rating,
      ]);
    }
  };

  const filteredFoods = foods
  .filter((food) => {
    if (
      showFavoritesOnly &&
      !favorites.includes(food.id)
    ) {
      return false;
    }
    if (
      !selectedRatings.includes(food.rating)
    ) {
      return false;
    }
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
    <>
    <div style={{ padding: "20px" }}>
      <h1>Histamin Tracker</h1>

      <div
        style={{
          position: "relative",
          width: "300px",
          margin: "0 auto 20px auto",
        }}
      >
        <input
          type="text"
          placeholder="Lebensmittel suchen..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 35px 8px 8px",
            boxSizing: "border-box",
          }}
        />

        {searchText && (
          <button
            onClick={() => setSearchText("")}
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "18px",
              color: "#888",
            }}
          >
            ✕
          </button>
        )}
      </div>

    <div
      style={{
        display: "flex",
        justifyContent: "center",
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
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        {[0, 1, 2, 3, 9].map((rating) => (

          <button
            key={rating}
            onClick={() =>
              toggleRating(rating)
            }
            style={{
              backgroundColor:
                selectedRatings.includes(rating)
                  ? getRatingColor(rating)
                  : "#ddd",

              color: "white",
              border: "none",
              borderRadius: "20px",
              padding: "8px 15px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {rating}
          </button>

        ))}
        <button
          onClick={() =>
            setShowFavoritesOnly(
              !showFavoritesOnly
            )
          }
          style={{
            backgroundColor:
              showFavoritesOnly
                ? "#FFD700"
                : "#ddd",
            color: showFavoritesOnly
              ? "black"
              : "black",
            border: "none",
            borderRadius: "20px",
            padding: "8px 15px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ★
        </button>
      </div>


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

  <div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
    textAlign: "center",
  }}
>
  <button
    onClick={() =>
      toggleFavorite(food.id)
    }
    style={{
      border: "none",
      background: "none",
      cursor: "pointer",
      fontSize: "24px",
      padding: 0,
    }}
  >
    {favorites.includes(food.id)
      ? "⭐"
      : "☆"}
  </button>

  <strong
    style={{
      fontSize: "28px",
    }}
  >
    {highlightText(
      food.name,
      searchText
    )}
  </strong>
</div>

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
                  Synonyme:{" "}
                  {food.synonyms.map(
                    (synonym, index) => (
                      <span key={index}>
                        {highlightText(
                          synonym,
                          searchText
                        )}
                        {index <
                          food.synonyms.length - 1 &&
                          ", "}
                      </span>
                    )
                  )}
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

    {showScrollTop && (
      <button
        onClick={scrollToTop}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          border: "none",
          backgroundColor: "#4CAF50",
          color: "white",
          fontSize: "24px",
          cursor: "pointer",
          boxShadow:
            "0 2px 10px rgba(0,0,0,0.3)",
          zIndex: 999,
        }}
      >
        ↑
      </button>
    )}
  </>
);
}

export default App;