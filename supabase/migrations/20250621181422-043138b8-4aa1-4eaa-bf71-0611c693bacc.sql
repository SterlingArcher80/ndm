
-- Insert category and location columns into inventory_columns table if they don't exist
INSERT INTO inventory_columns (name, label, type, is_required, order_position)
SELECT 'category', 'Category', 'text', false, -3
WHERE NOT EXISTS (SELECT 1 FROM inventory_columns WHERE name = 'category');

INSERT INTO inventory_columns (name, label, type, is_required, order_position)
SELECT 'location', 'Location', 'text', false, -2
WHERE NOT EXISTS (SELECT 1 FROM inventory_columns WHERE name = 'location');
