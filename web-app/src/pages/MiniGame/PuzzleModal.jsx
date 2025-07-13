import React, { useEffect, useState } from "react";

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const PuzzleModal = ({ open, onClose, onComplete }) => {
  const [tiles, setTiles] = useState([]);
  const [isSolved, setIsSolved] = useState(false);

  const initialTiles = [1, 2, 3, 4, 5, 6, 7, 8, null];

  useEffect(() => {
    if (open) {
      const shuffled = shuffleArray(initialTiles);
      setTiles(shuffled);
      setIsSolved(false);
    }
  }, [open]);

  const moveTile = (index) => {
    const emptyIndex = tiles.indexOf(null);
    const validMoves = [
      emptyIndex - 1,
      emptyIndex + 1,
      emptyIndex - 3,
      emptyIndex + 3,
    ];

    if (validMoves.includes(index)) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [
        newTiles[emptyIndex],
        newTiles[index],
      ];
      setTiles(newTiles);
      if (JSON.stringify(newTiles) === JSON.stringify(initialTiles)) {
        setIsSolved(true);
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white bg-opacity-90 backdrop-blur-md p-6 rounded-lg shadow-xl w-[300px] text-center">
        <h2 className="text-lg font-bold mb-4">🧩 Mini Puzzle Game</h2>
        <p className="mb-2 text-sm text-gray-600">Sắp xếp các số từ 1 đến 8 theo thứ tự.</p>
        <div className="grid grid-cols-3 gap-1 mb-4">
          {tiles.map((tile, index) => (
            <button
              key={index}
              onClick={() => moveTile(index)}
              className={`h-16 w-16 border text-xl font-bold rounded-md transition-all duration-200
                ${tile ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200"}`}
              disabled={tile === null}
            >
              {tile}
            </button>
          ))}
        </div>

        {isSolved ? (
          <button
            onClick={() => {
              onComplete();
              onClose();
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            🎉 Hoàn thành!
          </button>
        ) : (
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:underline"
          >
            Thoát
          </button>
        )}
      </div>
    </div>
  );
};

export default App;