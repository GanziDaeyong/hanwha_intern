import axios from "axios";
import cheerio from "cheerio";

export const crawl = async (accountAddress, res) => {
  let url =
    "https://ropsten.etherscan.io/address/" + accountAddress + "#tokentxns";
  // "ropsten.etherscan.io/address/" + accountAddress + "#tokentxns";
  console.log(url);

  let html;
  try {
    html = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
      },
    });
  } catch (err) {
    console.log(err);
  }

  console.log(html.data);
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
};
