#!/bin/bash
cd /home/jeongdaeyong/Desktop/Hanwha/최종서버/TokenCompileServer/hanwha/TokenCompiling
python3 tokenTemplate.py $1 $2 $3
pid=$!
wait $pid
solcjs --bin ./NEWTOKEN.sol
pid=$!
wait $pid
cat ./NEWTOKEN_sol_NEWTOKEN.bin

rm node_modules_openzeppelin-solidity_contracts_token_ERC20_ERC20_sol_ERC20.bin
rm node_modules_openzeppelin-solidity_contracts_token_ERC20_extensions_IERC20Metadata_sol_IERC20Metadata.bin
rm node_modules_openzeppelin-solidity_contracts_token_ERC20_IERC20_sol_IERC20.bin
rm node_modules_openzeppelin-solidity_contracts_utils_Context_sol_Context.bin
rm NEWTOKEN.sol
rm NEWTOKEN_sol_NEWTOKEN.bin

