import Trie from "../Trie";

test("Trie", function () {
  const trie = new Trie<string, string>();
  trie.insert([..."foo"]);
  trie.insert([..."fool"]);
  trie.insert([..."foolish"]);
  trie.insert([..."bar"]);
  // console.log(JSON.stringify(trie, null, 2));

  expect(trie.find("fo").sort()).toEqual(["foo", "fool", "foolish"]);

  trie.delete("fool");
  expect(trie.find("fo").sort()).toEqual(["foo", "foolish"]);

  trie.delete("foolish");
  expect(trie.find("fo").sort()).toEqual(["foo"]);
  // console.log(JSON.stringify(trie, null, 2));
});

test("Trie2", function () {
  const trie = new Trie<string, string>();
  trie.insert([..."bar"]);
  trie.insert([..."foo"]);
  trie.insert([..."fool"]);
  trie.insert([..."foolish"]);
  // console.log(JSON.stringify(trie, null, 2));

  expect(trie.find("fo").sort()).toEqual(["foo", "fool", "foolish"]);

  trie.delete("fool");

  expect(trie.find("fo").sort()).toEqual(["foo", "foolish"]);
});

test("Trie - Empty Trie", function () {
  const trie = new Trie<string, string>();

  expect(trie.find("foo")).toEqual([]);
});

test("Trie - Insert Empty Key", function () {
  const trie = new Trie<string, string>();
  console.log(JSON.stringify(trie, null, 2));

  trie.insert([]);
  console.log(JSON.stringify(trie, null, 2));

  expect(trie.find("")).toEqual([]);
});

test("Trie - Delete Nonexistent Key", function () {
  const trie = new Trie<string, string>();
  trie.insert([..."foo"]);

  trie.delete("bar");

  expect(trie.find("foo")).toEqual(["foo"]);
});

test("Trie - Delete Key with Common Prefix", function () {
  const trie = new Trie<string, string>();
  trie.insert([..."foo"]);
  trie.insert([..."foobar"]);

  trie.delete("foo");

  expect(trie.find("foo")).toEqual(["foobar"]);
});
test("Trie - Empty Trie", function () {
  const trie = new Trie<string, string>();

  expect(trie.find("foo")).toEqual([]);
});

test("Trie - Insert Empty Key", function () {
  const trie = new Trie<string, string>();

  trie.insert([]);

  expect(trie.find("")).toEqual([]);
});

test("Trie - Delete Nonexistent Key", function () {
  const trie = new Trie<string, string>();
  trie.insert([..."foo"]);

  trie.delete("bar");

  expect(trie.find("foo")).toEqual(["foo"]);
});

test("Trie - Delete Key with Common Prefix", function () {
  const trie = new Trie<string, string>();
  trie.insert([..."foo"]);
  trie.insert([..."foobar"]);

  trie.delete("foo");

  expect(trie.find("foo")).toEqual(["foobar"]);
});

test("Trie - Find Key with Common Prefix", function () {
  const trie = new Trie<string, string>();
  trie.insert([..."foo"]);
  trie.insert([..."foobar"]);

  expect(trie.find("foo")).toEqual(["foo", "foobar"]);
});

test("Trie - Find Key with No Match", function () {
  const trie = new Trie<string, string>();
  trie.insert([..."foo"]);
  trie.insert([..."bar"]);

  expect(trie.find("baz")).toEqual([]);
});

test("Trie - Insert Same Key Multiple Times", function () {
  const trie = new Trie<string, string>();
  trie.insert([..."foo"]);
  trie.insert([..."foo"]);

  expect(trie.find("foo")).toEqual(["foo"]);
});

test("Trie - Insert Key with Special Characters", function () {
  const trie = new Trie<string, string>();
  trie.insert([..."foo!@#"]);

  expect(trie.find("foo!@#")).toEqual(["foo!@#"]);
});

test("Trie - Insert Key with Varying Case", function () {
  const trie = new Trie<string, string>();
  trie.insert([..."Foo"]);
  trie.insert([..."foo"]);

  expect(trie.find("Foo")).toEqual(["Foo"]);
  expect(trie.find("foo")).toEqual(["foo"]);
});

test("Trie - Find Partially Inserted Key", function () {
  const trie = new Trie<string, string>();
  trie.insert([..."fo"]);

  expect(trie.find("foo")).toEqual(["fo"]);
});

test("Trie - Delete Non-Inserted Key", function () {
  const trie = new Trie<string, string>();
  trie.delete("foo");

  expect(trie.find("foo")).toEqual([]);
});
