DROP DATABASE IF EXISTS rsquared;
CREATE DATABASE rsquared;
\c rsquared

DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO users (username, password, email) VALUES ('abc', 'mycoolpassword', 'abc@email.com');
INSERT INTO users (username, password, email) VALUES ('admin', 'root', 'admin@email.com');
INSERT INTO users (username, password, email) VALUES ('fiddlesticks', 'bibblebap', 'fiddlesticks@email.com');

DROP TABLE IF EXISTS items;
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(50),
    image BOOLEAN
);

INSERT INTO items (name, category, image) VALUES ('phillies baseball cap', 'hat', true);
INSERT INTO items (name, category, image) VALUES ('phillies jersey', 'shirt', true);
INSERT INTO items (name, category, image) VALUES ('eagles sweatshirt', 'jacket', true);
INSERT INTO items (name, category, image) VALUES ('blue jeans', 'pants', true);
INSERT INTO items (name, category, image) VALUES ('black dickies', 'pants', true);
INSERT INTO items (name, category, image) VALUES ('white converse', 'shoes', true);

DROP TABLE IF EXISTS outfits;
CREATE TABLE outfits (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    hat INTEGER REFERENCES items(id),
    shirt INTEGER REFERENCES items(id),
    jacket INTEGER REFERENCES items(id),
    pants INTEGER REFERENCES items(id),
    shoes INTEGER REFERENCES items(id),
    user_id INTEGER REFERENCES users(id)
);

INSERT INTO outfits (name, hat, shirt, pants, shoes, user_id) VALUES ('phillies outfit', 1, 2, 4, 6, 2);
INSERT INTO outfits (name, jacket, pants, shoes, user_id) VALUES ('eagles outfit', 3, 5, 6, 3);

DROP TABLE IF EXISTS posts;
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    caption TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    outfit_id INTEGER REFERENCES outfits(id),
    user_id INTEGER REFERENCES users(id)
);

INSERT INTO posts (caption, outfit_id, user_id) VALUES ('LETS GO PHILLIES', 1, 2);
INSERT INTO posts (caption, outfit_id, user_id) VALUES ('LETS GO EAGLES', 2, 3);

DROP TABLE IF EXISTS comments;
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    text TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    user_id INTEGER REFERENCES users(id),
    post_id INTEGER REFERENCES posts(id)
);

DROP TABLE IF EXISTS likes;
CREATE TABLE likes (
    user_id INTEGER REFERENCES users(id),
    post_id INTEGER REFERENCES posts(id),
    PRIMARY KEY (user_id, post_id)
);

DROP TABLE IF EXISTS friendships;
CREATE TABLE friendships (
    user1_id INTEGER REFERENCES users(id),
    user2_id INTEGER REFERENCES users(id),
    PRIMARY KEY (user1_id, user2_id)
);

INSERT INTO friendships (user1_id, user2_id) VALUES (1, 2);
INSERT INTO friendships (user1_id, user2_id) VALUES (1, 3);