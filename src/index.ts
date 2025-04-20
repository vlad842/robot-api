import * as starAverage from "./star-average";
import * as oracleRolodex from "./oracle-rolodex";
import * as pokemon from "./pokemon";
import './repair-robot';

//starAverage.main()
// Example usage of oracleRolodex (replace with actual function or operation)
pokemon.run().then((pok) => {
    console.log("planets:", pok);
}
).catch((error) => {
    console.error("Error fetching planets:", error);
}   );