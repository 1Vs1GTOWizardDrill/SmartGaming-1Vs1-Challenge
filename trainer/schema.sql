CREATE TABLE IF NOT EXISTS spots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_file TEXT NOT NULL,
  player INTEGER NOT NULL,
  street INTEGER NOT NULL,
  actions_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hand_solutions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  spot_id INTEGER NOT NULL,
  hand TEXT NOT NULL,
  weight REAL NOT NULL,
  best_action TEXT NOT NULL,
  mix_json TEXT NOT NULL,
  ev_json TEXT NOT NULL,
  FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_hand_solutions_spot ON hand_solutions(spot_id);
CREATE INDEX IF NOT EXISTS idx_hand_solutions_hand ON hand_solutions(hand);
