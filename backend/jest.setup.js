const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// 在所有测试之前运行
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// 在每个测试之后运行
afterEach(async () => {
  // 清除数据库中的所有数据
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// 在所有测试之后运行
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});