import sys

name = sys.argv[1]
sym = sys.argv[2]
mint = sys.argv[3]

content = '// SPDX-License-Identifier: MIT\npragma solidity >=0.4.22 <0.9.0;\nimport "./node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";\ncontract NEWTOKEN is ERC20{\n   constructor() ERC20("TOKENNAME", "TOKENSYMBOL"){\n      _mint(msg.sender, MINTVALUE);\n   }\n}'
content = content.replace("TOKENNAME", name).replace("TOKENSYMBOL", sym).replace("MINTVALUE", mint)

with open("NEWTOKEN.sol", 'w', encoding='utf-8') as fo:
    fo.write(content)
    
