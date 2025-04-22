import express from 'express';
import * as starAverage from "./star-average";
import * as oracleRolodex from "./oracle-rolodex";
import * as pokemon from "./pokemon";
import repairRobotRouter from './repair-robot';
import { collectWords} from './altwarts';
const app = express();
const port = process.env.PORT || 3000;

//collectWords();
// Use the repair robot router
app.use('/', repairRobotRouter);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

//starAverage.main()
// Example usage of oracleRolodex (replace with actual function or operation)