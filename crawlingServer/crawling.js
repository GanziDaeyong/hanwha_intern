import axios from "axios";
import cheerio from "cheerio";

export const crawl = async (accountAddress, res) => {
  let url =
    "https://ropsten.etherscan.io/address/" + accountAddress + "#tokentxns";
  console.log(url);
  const html = await axios.get(url);
  //   console.log(html.data);
  let $;
  try {
    $ = cheerio.load(html.data);
  } catch (err) {
    console.log(err);
    return;
  }

  let tokens = {
    name: [],
    sym: [],
    bal: [],
    link: [],
  };

  try {
    $(".link-hover", ".list-custom-ERC20").each((index, value) => {
      let name = $(value).text();
      let link = $(value).attr("href");
      link = link.substring(7);
      link = link.replace("?a=" + accountAddress, "");
      let arr = name.split(" ");

      let idx = arr[1].indexOf(")");
      let bal = arr[1].substring(idx + 1); // cut string

      tokens.sym.push(arr[2].trim());
      tokens.name.push(arr[0].trim());
      tokens.bal.push(bal.trim());
      tokens.link.push(link.trim());
    });
  } catch (err) {
    console.log(err);
  }

  res.json({ tokens: tokens });

  // console.log(tokens);
  // return tokens;
};

// async function pickElement(accountAddress) {
//   let url =
//     "https://ropsten.etherscan.io/address/" + accountAddress + "#tokentxns";

//   const html = await axios.get(url);
//   //   console.log(html.data);
//   let $;
//   try {
//     $ = cheerio.load(html.data);
//   } catch (err) {
//     console.log(err);
//     return;
//   }

//   let tokens = {
//     name: [],
//     link: [],
//   };

//   try {
//     $(".link-hover", ".list-custom-ERC20").each((index, value) => {
//       let name = $(value).text();
//       let link = $(value).attr("href");
//       link = link.substring(7);
//       link = link.replace("?a=" + accountAddress, "");
//       tokens.name.push(name);
//       tokens.link.push(link);
//     });
//   } catch (err) {
//     console.log(err);
//   }
//   console.log(tokens);
// }

// const testAcc1 = "0x5cce38322f190eab8abc7ceb23e816cf7d3b48dc";
// const testAcc2 = "0xa7c1b07c893cA1934BB4F5730a3008503e804F5d";
// pickElement(testAcc2);
