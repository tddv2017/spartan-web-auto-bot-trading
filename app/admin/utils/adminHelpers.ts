// utils/adminHelpers.ts

export const getVietQRBankCode = (fullName: string) => {
    if (!fullName) return "";
    const name = fullName.toLowerCase();
    if (name.includes("vietinbank")) return "ICB"; 
    if (name.includes("vietcombank")) return "VCB";
    if (name.includes("mbbank") || name.includes("quân đội")) return "MB";
    if (name.includes("techcombank")) return "TCB";
    if (name.includes("acb")) return "ACB";
    if (name.includes("bidv")) return "BIDV";
    if (name.includes("vpbank")) return "VPB";
    if (name.includes("tpbank")) return "TPB";
    if (name.includes("sacombank")) return "STB";
    if (name.includes("vib")) return "VIB";
    if (name.includes("hdbank")) return "HDB";
    if (name.includes("msb")) return "MSB";
    if (name.includes("ocb")) return "OCB";
    if (name.includes("shb")) return "SHB";
    if (name.includes("eximbank")) return "EIB";
    if (name.includes("seabank")) return "SEAB";
    if (name.includes("abbank")) return "ABB";
    if (name.includes("agribank")) return "VBA";
    
    const match = fullName.match(/\(([^)]+)\)/);
    if (match && match[1]) return match[1].trim();
    return fullName.split(' ')[0];
};