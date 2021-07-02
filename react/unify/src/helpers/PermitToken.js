import { ethers } from 'ethers';

export function packSignature(sig) {
    if (sig.s.length !== 66) throw('unexpected length for s');
    let msb = parseInt(sig.s.substr(2,2), 16);
    if ((msb & 128) !== 0) throw('most significant bit of s was set');
    if (sig.v !== 27 && sig.v !== 28) throw('unexpected value for v');

    if (sig.v === 28) msb |= 128;
    return [sig.r, hexNormalize(msb, 1) + sig.s.substr(4)];
}

export function unpackSignature(packed) {
    let msb = parseInt(packed[1].substr(2,2), 16);

    return {
        r: packed[0],
        s: hexNormalize(msb & 127, 1) + packed[1].substr(4),
        v: (msb & 128) ? 28 : 27,
    };
}

function hexNormalize(inp, numBytes) {
    inp = ethers.utils.hexZeroPad(ethers.utils.hexlify(inp), numBytes);
    if (inp.length !== (numBytes*2)+2) throw(`input ${inp} exceeds ${numBytes} bytes`);
    return inp.toLowerCase();
}

const domainSchema = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
];

const permitSchema = [
    { name: "holder", type: "address" },
    { name: "spender", type: "address" },
    { name: "nonce", type: "uint256" },
    { name: "expiry", type: "uint256" },
    { name: "allowed", type: "bool" },
];



export const domains = {
    daiMainnet: {
        name: "Dai Stablecoin",
        version: "1",
        chainId: "1",
        verifyingContract: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    },
    daiHardhat: {
        name: "Dai Stablecoin",
        version: "1",
        chainId: "31337",
        verifyingContract: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    },
};




export async function signPermit(provider, domain, message) {
    let signer = provider.getSigner();
    let myAddr = await signer.getAddress();

    if (myAddr.toLowerCase() !== message.holder.toLowerCase()) {
        throw(`signPermit: address of signer does not match holder address in message`);
    }

    if (message.nonce === undefined) {
        let tokenAbi = [ 'function nonces(address holder) view returns (uint)', ];

        let tokenContract = new ethers.Contract(domain.verifyingContract, tokenAbi, provider);

        let nonce = await tokenContract.nonces(myAddr);

        message = { ...message, nonce: nonce.toString(), };
    }

    let typedData = {
        types: {
            EIP712Domain: domainSchema,
            Permit: permitSchema,
        },
        primaryType: "Permit",
        domain,
        message,
    };

    let sig = await provider.send(
                        'eth_signTypedData_v3',
                        [myAddr, JSON.stringify(typedData)]
                    );

    return { domain, message, sig, };
}

// Structure of message
// const message = {
//     holder,
//     spender,
//     expiry: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
//     allowed: true,
// };