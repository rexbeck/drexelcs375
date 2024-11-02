CREATE DATABASE rsquared;
\c rsquared

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    text TEXT,
    image VARCHAR(255),
    timestamp TIMESTAMP DEFAULT NOW(),
    user_id INTEGER REFERENCES users(id)
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    text TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    user_id INTEGER REFERENCES users(id),
    post_id INTEGER REFERENCES posts(id)
);

CREATE TABLE likes (
    user_id INTEGER REFERENCES users(id),
    post_id INTEGER REFERENCES posts(id),
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE friendships (
    user1_id INTEGER REFERENCES users(id),
    user2_id INTEGER REFERENCES users(id),
    PRIMARY KEY (user1_id, user2_id)
);

CREATE TABLE outfits (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    user_id INTEGER REFERENCES users(id)
);

CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(50),
    image BOOLEAN
);

CREATE TABLE outfit_items (
    outfit_id INTEGER REFERENCES outfits(id),
    item_id INTEGER REFERENCES items(id),
    PRIMARY KEY (outfit_id, item_id)
);
