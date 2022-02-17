package hanwha.hanwha;

import org.springframework.web.bind.annotation.*;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.InputStream;



@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class PostAPIController {

    JSONParser parser = new JSONParser();

    @PostMapping(path = "/createtoken")
    public JSONObject getTokenInfo(@RequestBody String tokenInfo) throws Exception {
        Object obj = parser.parse( tokenInfo );
        JSONObject jsonObj = (JSONObject) obj;
        System.out.println(jsonObj.get("totalsupply"));
        String bytecode = callTruffle(jsonObj);

        JSONObject jsonOutObj = new JSONObject();
        jsonOutObj.put("bytecode", bytecode);

    return jsonOutObj;
        //System.out.println("Working Directory = " + System.getProperty("user.dir"));
//	return bytecode;
    }

    private String callTruffle(JSONObject jsonObj){
        try {
            String totalSupplyRemoveComma = jsonObj.get("totalsupply").toString();
            totalSupplyRemoveComma = totalSupplyRemoveComma.replace(",","");

//            String command = "bash ./TokenCompiling/getBinary.sh" + " " +jsonObj.get("name") + " " + jsonObj.get("sym") + " "+ jsonObj.get("totalsupply");
            String command = "bash ./TokenCompiling/getBinary.sh" + " " +jsonObj.get("name") + " " + jsonObj.get("sym") + " "+ totalSupplyRemoveComma;
            System.out.println(command);
	   
            Process process = Runtime.getRuntime().exec(command);

            // Read output
            StringBuilder output = new StringBuilder();
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()));

            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line);
            }

            return output.toString();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return "";

    }
}
