-- Seed data pour Riwaya
-- Exécuter avec: mysql -u riwaya_user -p riwaya_db < prisma/seed.sql

-- 1. Admin user (password: admin123)
INSERT INTO users (id, email, password, role, createdAt, updatedAt) VALUES
('admin-uuid-001', 'admin@riwaya.com', '$2a$10$rZ5qKZ5qKZ5qKZ5qKZ5qKOqKZ5qKZ5qKZ5qKZ5qKZ5qKZ5qKZ5qKZ', 'ADMIN', NOW(), NOW());

-- 2. Livres
INSERT INTO books (id, title, author, description, isbn, price, stock, image, category, active, createdAt, updatedAt) VALUES
(UUID(), 'Atomic Habits', 'James Clear', 'Un guide pratique pour créer de bonnes habitudes et éliminer les mauvaises.', '9780735211292', 150, 50, '/images/books/atomic-habits.jpg', 'Développement personnel', 1, NOW(), NOW()),
(UUID(), 'Deep Work', 'Cal Newport', 'Règles pour une concentration réussie dans un monde distrait.', '9781455586691', 180, 35, '/images/books/deep-work.jpg', 'Productivité', 1, NOW(), NOW()),
(UUID(), 'The 48 Laws of Power', 'Robert Greene', 'Les 48 lois du pouvoir pour réussir dans la vie.', '9780140280197', 200, 25, '/images/books/48-laws.jpg', 'Stratégie', 1, NOW(), NOW()),
(UUID(), 'Thinking, Fast and Slow', 'Daniel Kahneman', 'Une exploration fascinante des deux systèmes qui régissent notre façon de penser.', '9780374533557', 220, 30, '/images/books/thinking-fast-slow.jpg', 'Psychologie', 1, NOW(), NOW()),
(UUID(), 'The Lean Startup', 'Eric Ries', 'Comment les entrepreneurs utilisent l\'innovation continue.', '9780307887894', 170, 40, '/images/books/lean-startup.jpg', 'Business', 1, NOW(), NOW()),
(UUID(), 'Sapiens', 'Yuval Noah Harari', 'Une brève histoire de l\'humanité.', '9780062316097', 250, 20, '/images/books/sapiens.jpg', 'Histoire', 1, NOW(), NOW()),
(UUID(), 'The Psychology of Money', 'Morgan Housel', 'Leçons intemporelles sur la richesse.', '9780857197689', 160, 45, '/images/books/psychology-money.jpg', 'Finance', 1, NOW(), NOW()),
(UUID(), 'Start with Why', 'Simon Sinek', 'Comment les grands leaders inspirent l\'action.', '9781591846444', 175, 38, '/images/books/start-with-why.jpg', 'Leadership', 1, NOW(), NOW()),
(UUID(), 'The 7 Habits', 'Stephen Covey', 'Un guide puissant pour le développement personnel.', '9781982137274', 190, 42, '/images/books/7-habits.jpg', 'Développement personnel', 1, NOW(), NOW()),
(UUID(), 'Zero to One', 'Peter Thiel', 'Notes sur les startups.', '9780804139298', 165, 33, '/images/books/zero-to-one.jpg', 'Business', 1, NOW(), NOW());
