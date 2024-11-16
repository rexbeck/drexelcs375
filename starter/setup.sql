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

DROP TABLE IF EXISTS posts;
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    text TEXT,
    image VARCHAR(255),
    timestamp TIMESTAMP DEFAULT NOW(),
    user_id INTEGER REFERENCES users(id)
);

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

DROP TABLE IF EXISTS outfits;
CREATE TABLE outfits (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    user_id INTEGER REFERENCES users(id)
);

DROP TABLE IF EXISTS items;
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(50),
    image VARCHAR(255)
);

DROP TABLE IF EXISTS outfit_items;
CREATE TABLE outfit_items (
    outfit_id INTEGER REFERENCES outfits(id),
    item_id INTEGER REFERENCES items(id),
    PRIMARY KEY (outfit_id, item_id)
);

INSERT INTO users (username, password, email) VALUES ('abc', 'mycoolpassword', 'abc@email.com');
INSERT INTO users (username, password, email) VALUES ('admin', 'root', 'admin@email.com');
INSERT INTO users (username, password, email) VALUES ('fiddlesticks', 'bibblebap', 'fiddlesticks@email.com');