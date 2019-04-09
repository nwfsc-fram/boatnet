interface DBConfig {
  apiUrl?: string;
}

// Leave unchanged for Dev - overwritten in Prod
const dbConfig: DBConfig = {
  // apiUrl: 'https://localhost:9000'
};

export default dbConfig;
