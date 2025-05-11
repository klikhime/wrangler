DROP TABLE IF EXISTS items;
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert some initial data
INSERT INTO items (name, description) VALUES 
('Item Pertama', 'Ini adalah item pertama dalam database.'),
('Item Kedua', 'Ini adalah item kedua dalam database.');