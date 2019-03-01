interface Testing {
  message: string;
}

class TestStuff implements Testing {
  message = 'Test typescript';
}

const thing = new TestStuff();
console.log(thing.message);
