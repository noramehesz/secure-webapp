import { Selector } from "testcafe";

fixture("Test webapp").page("localhost:3000/sender");

test("create session and send a message", async (t) => {
  const sender = await t.getCurrentWindow();
  await t.click(".sessionButton");

  const url = await Selector(".urlToName").innerText;
  const receiver = await t.openWindow(`http://${url}`);

  await t.switchToWindow(sender);
  await t.typeText(".sharedData", "top secret");

  await t.switchToWindow(receiver);

  const data = await Selector(".recievedData").innerText;

  await t.expect(data).eql("top secret");
});

test("create session and open a receiver with a wrong key", async (t) => {
  const sender = await t.getCurrentWindow();
  await t.click(".sessionButton");

  const url = await Selector(".urlToName").innerText;
  const receiver = await t.openWindow(`http://${url}ascd1`);

  await t.switchToWindow(sender);
  await t.typeText(".sharedData", "top secret");

  await t.switchToWindow(receiver);

  const data = await Selector(".recievedData").innerText;

  await t.expect(data).eql("error while decrypting the data");
});
