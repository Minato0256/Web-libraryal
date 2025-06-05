#! /usr/bin/env node

console.log(
  'This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.cojoign.mongodb.net/local_library?retryWrites=true&w=majority&appName=Cluster0"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Book = require("./models/book");
const Author = require("./models/author");
const Genre = require("./models/genre");
const BookInstance = require("./models/bookinstance");

const genres = [];
const authors = [];
const books = [];
const bookinstances = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("デバッグ:接続について確認します");
  await mongoose.connect(mongoDB);
  console.log("デバッグ:接続されているはずですか？");
  await createGenres();
  await createAuthors();
  await createBooks();
  await createBookInstances();
  console.log("デバッグ:mongooseを閉じます");
  mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// genre[0] will always be the Fantasy genre, regardless of the order
// in which the elements of promise.all's argument complete.
async function genreCreate(index, name) {
  const genre = new Genre({ name: name });
  await genre.save();
  genres[index] = genre;
  console.log(`ジャンルの追加: ${name}`);
}

async function authorCreate(index, first_name, family_name, d_birth, d_death) {
  const authordetail = { first_name: first_name, family_name: family_name };
  if (d_birth != false) authordetail.date_of_birth = d_birth;
  if (d_death != false) authordetail.date_of_death = d_death;

  const author = new Author(authordetail);

  await author.save();
  authors[index] = author;
  console.log(`著者の追加: ${first_name} ${family_name}`);
}

async function bookCreate(index, title, summary, isbn, author, genre) {
  const bookdetail = {
    title: title,
    summary: summary,
    author: author,
    isbn: isbn,
  };
  if (genre != false) bookdetail.genre = genre;

  const book = new Book(bookdetail);
  await book.save();
  books[index] = book;
  console.log(`書籍の追加: ${title}`);
}

async function bookInstanceCreate(index, book, imprint, due_back, status) {
  const bookinstancedetail = {
    book: book,
    imprint: imprint,
  };
  if (due_back != false) bookinstancedetail.due_back = due_back;
  if (status != false) bookinstancedetail.status = status;

  const bookinstance = new BookInstance(bookinstancedetail);
  await bookinstance.save();
  bookinstances[index] = bookinstance;
  console.log(`ブックインスタンスの追加: ${imprint}`);
}

async function createGenres() {
  console.log("ジャンルの追加");
  await Promise.all([
    genreCreate(0, "ファンタジー"),
    genreCreate(1, "サイエンスフィクション"),
    genreCreate(2, "フランス詩"),
  ]);
}

async function createAuthors() {
  console.log("著者の追加");
  await Promise.all([
    authorCreate(0, "パトリック", "ロスファス", "1973-06-06", false),
    authorCreate(1, "ベン", "ボヴァ", "1932-11-8", false),
    authorCreate(2, "アイザック", "アシモフ", "1920-01-02", "1992-04-06"),
    authorCreate(3, "ボブ", "ビリングス", false, false),
    authorCreate(4, "ジム", "ジョーンズ", "1971-12-16", false),
  ]);
}

async function createBooks() {
  console.log("書籍の追加");
  await Promise.all([
    bookCreate(
      0,
      "風の名前 (キングキラー　クロニクル, #1)",
      "眠れる古墳の王たちから王女たちを奪い返した。トレボンの町を焼き払った。フェルリアンと一夜を過ごし、正気と命を救った。大学からは、入学が認められる年齢よりも若くして退学になった。昼間は口にするのも憚られるような道を、月明かりの下で歩いた。神々と語り合い、女性を愛し、吟遊詩人を泣かせる歌を書いた。",
      "9781473211896",
      authors[0],
      [genres[0]]
    ),
    bookCreate(
      1,
      "賢者の恐れ (キングキラー　クロニクル, #2)",
      "Kvothe Kingkillerの物語を再び追い、彼を亡命、政治的陰謀、恋愛、冒険、愛、魔法の世界へと導きます... そして、Kvotheをその時代の最強の魔法使いから、無名のパブの主人Koteへと変えた道をさらに進んでいきます。",
      "9788401352836",
      authors[0],
      [genres[0]]
    ),
    bookCreate(
      2,
      "静かなものの遅い考察 (キングキラー　クロニクル)",
      "大学の深い地下には、暗い場所があります。そこを知っている人はほとんどいません: 古代の通路と放棄された部屋の壊れた網です。若い女性がそこに住んでおり、Underthingの広がるトンネルの中で、忘れられた場所の中心にぴったりと収まっています。",
      "9780756411336",
      authors[0],
      [genres[0]]
    ),
    bookCreate(
      3,
      "サルと天使",
      "人類は征服や探検、好奇心のためではなく、星々へと向かいました。人類は、知的生命を救うための必死の十字軍として星々へと向かいました。死の波が銀河系を横断して広がっており、致命的なガンマ線の膨張する球体が形成されています。",
      "9780765379528",
      authors[1],
      [genres[1]]
    ),
    bookCreate(
      4,
      "死の波",
      "ベン・ボヴァの前作『New Earth』では、ジョーダン・ケルが太陽系を超えた最初の人類ミッションを指揮しました。彼らは古代の異星文明の遺跡を発見しました。しかし、一つの異星AIが生き残り、銀河系の中心にあるブラックホールでの爆発が致命的な放射線の波を生み出し、地球に向かって拡大していることをジョーダン・ケルに明らかにしました。人類が自らを救うために行動しなければ、地球上のすべての生命は消滅してしまいます。",
      "9780765379504",
      authors[1],
      [genres[1]]
    ),
    bookCreate(
      5,
      "テスト書籍 1",
      "テスト書籍 1の要約",
      "ISBN111111",
      authors[4],
      [genres[0], genres[1]]
    ),
    bookCreate(
      6,
      "テスト書籍 2",
      "テスト書籍 2の要約",
      "ISBN222222",
      authors[4],
      false
    ),
  ]);
}

async function createBookInstances() {
  console.log("著者の追加");
  await Promise.all([
    bookInstanceCreate(
      0,
      books[0],
      "ロンドン・ゴランツ, 2014.",
      false,
      "入手可能"
    ),
    bookInstanceCreate(1, books[1], " ゴランツ, 2011.", false, "Loaned"),
    bookInstanceCreate(2, books[2], " ゴランツ, 2015.", false, false),
    bookInstanceCreate(
      3,
      books[3],
      "ニューヨーク・トム・ドハーティ・アソシエイツ, 2016.",
      false,
      "入手可能"
    ),
    bookInstanceCreate(
      4,
      books[3],
      "ニューヨーク・トム・ドハーティ・アソシエイツ, 2016.",
      false,
      "入手可能"
    ),
    bookInstanceCreate(
      5,
      books[3],
      "ニューヨーク・トム・ドハーティ・アソシエイツ, 2016.",
      false,
      "入手可能"
    ),
    bookInstanceCreate(
      6,
      books[4],
      "ニューヨーク, NY トム・ドハーティ・アソシエイツ, LLC, 2015.",
      false,
      "入手可能"
    ),
    bookInstanceCreate(
      7,
      books[4],
      "ニューヨーク, NY トム・ドハーティ・アソシエイツ, LLC, 2015.",
      false,
      "メンテナンス中"
    ),
    bookInstanceCreate(
      8,
      books[4],
      "ニューヨーク, NY トム・ドハーティ・アソシエイツ, LLC, 2015.",
      false,
      "貸し出し中"
    ),
    bookInstanceCreate(9, books[0], "Imprint XXX2", false, false),
    bookInstanceCreate(10, books[1], "Imprint XXX3", false, false),
  ]);
}
