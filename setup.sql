\c rsquaredcloset

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO users (username, password, email) VALUES ('abc', 'mycoolpassword', 'abc@email.com');
INSERT INTO users (username, password, email) VALUES ('admin', 'root', 'admin@email.com');
INSERT INTO users (username, password, email) VALUES ('fiddlesticks', 'bibblebap', 'fiddlesticks@email.com');
INSERT INTO users (username, password, email) VALUES ('test', 'test', 'test@email.com');
INSERT INTO users (username, password, email) VALUES ('coolguy', 'coolpassword', 'coolguy@email.com');

DROP TABLE IF EXISTS items CASCADE;
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(50),
    image VARCHAR(100)
);

INSERT INTO items (name, category, image) VALUES ('phillies baseball cap', 'hat', 'phillies-hat.jpg');
INSERT INTO items (name, category, image) VALUES ('phillies jersey', 'shirt', 'phillies-jersey.jpg');
INSERT INTO items (name, category, image) VALUES ('eagles sweatshirt', 'jacket', 'eagles-sweatshirt.jpg');
INSERT INTO items (name, category, image) VALUES ('blue jeans', 'pants', 'blue-jeans.jpg');
INSERT INTO items (name, category, image) VALUES ('black dickies', 'pants', 'black-dickies.jpg');
INSERT INTO items (name, category, image) VALUES ('white converse', 'shoes', 'white-converse.jpg');
INSERT INTO items (name, category, image) VALUES ('black jacket', 'jacket', 'black-jacket.jpg');

DROP TABLE IF EXISTS outfits CASCADE;
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
INSERT INTO outfits (name, hat, jacket, shirt, pants, shoes, user_id) VALUES ('night on the town', 1, 7, 3, 4, 6, 5);


DROP TABLE IF EXISTS posts CASCADE;
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    caption TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    outfit_id INTEGER REFERENCES outfits(id),
    user_id INTEGER REFERENCES users(id)
);

INSERT INTO posts (caption, outfit_id, user_id) VALUES ('LETS GO PHILLIES', 1, 2);
INSERT INTO posts (caption, outfit_id, user_id) VALUES ('night on the town B)', 3, 5);
INSERT INTO posts (caption, outfit_id, user_id) VALUES ('LETS GO EAGLES', 2, 1);
INSERT INTO posts (caption, outfit_id, user_id) VALUES ('phillies 2', 1, 1);
INSERT INTO posts (caption, outfit_id, user_id) VALUES ('phillies 3', 1, 5);
INSERT INTO posts (caption, outfit_id, user_id) VALUES ('eagles 2', 2, 2);

DROP TABLE IF EXISTS comments CASCADE;
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    text TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    user_id INTEGER REFERENCES users(id),
    post_id INTEGER REFERENCES posts(id)
);

INSERT INTO comments (text, user_id, post_id) VALUES ('this outfit is dum', 3, 1);
INSERT INTO comments (text, user_id, post_id) VALUES ('*dumb', 3, 1);
INSERT INTO comments (text, user_id, post_id) VALUES ('i love eagles', 2, 2);
INSERT INTO comments (text, user_id, post_id) VALUES ('red looks great on you', 3, 3);
INSERT INTO comments (text, user_id, post_id) VALUES ('awesome game last night', 5, 3);
INSERT INTO comments (text, user_id, post_id) VALUES ('i love when they do the thing with the ball', 5, 4);
INSERT INTO comments (text, user_id, post_id) VALUES ('ball is life', 3, 4);
INSERT INTO comments (text, user_id, post_id) VALUES ('EAGLESSSSSSSSS', 4, 6);

DROP TABLE IF EXISTS likes CASCADE;
CREATE TABLE likes (
    user_id INTEGER REFERENCES users(id),
    post_id INTEGER REFERENCES posts(id),
    PRIMARY KEY (user_id, post_id)
);

INSERT INTO likes (user_id, post_id) VALUES (2, 2);
INSERT INTO likes (user_id, post_id) VALUES (3, 3);
INSERT INTO likes (user_id, post_id) VALUES (5, 3);
INSERT INTO likes (user_id, post_id) VALUES (4, 6);

DROP TABLE IF EXISTS follows CASCADE;
CREATE TABLE follows (
    user1_id INTEGER REFERENCES users(id),
    user2_id INTEGER REFERENCES users(id),
    PRIMARY KEY (user1_id, user2_id)
);

INSERT INTO follows (user1_id, user2_id) VALUES (1, 2);
INSERT INTO follows (user1_id, user2_id) VALUES (1, 3);
INSERT INTO follows (user1_id, user2_id) VALUES (1, 4);
INSERT INTO follows (user1_id, user2_id) VALUES (1, 5);
INSERT INTO follows (user1_id, user2_id) VALUES (2, 1);
INSERT INTO follows (user1_id, user2_id) VALUES (2, 4);
INSERT INTO follows (user1_id, user2_id) VALUES (4, 1);
INSERT INTO follows (user1_id, user2_id) VALUES (4, 2);
INSERT INTO follows (user1_id, user2_id) VALUES (4, 5);

DROP TABLE IF EXISTS usersettings CASCADE;
CREATE TABLE usersettings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE NOT NULL,
    is_private boolean NOT NULL
);

INSERT INTO usersettings (user_id, is_private) VALUES (1, TRUE);
INSERT INTO usersettings (user_id, is_private) VALUES (2, FALSE);
INSERT INTO usersettings (user_id, is_private) VALUES (3, TRUE);
INSERT INTO usersettings (user_id, is_private) VALUES (4, TRUE);
INSERT INTO usersettings (user_id, is_private) VALUES (5, FALSE);

\q
