// src/services/mockAI.js

const mockResponses = {
  greeting: [
    "Hello! I'm CyberGuard AI, your cybersecurity assistant. How can I help you today?",
    "Hi there! I'm here to help with your cybersecurity questions. What would you like to know?",
    "Greetings! I'm your CyberGuard AI assistant. What cybersecurity topic can I assist you with?"
  ],
  password: [
    "Strong passwords are essential for security. Here are some tips:\n\n- Use at least 12 characters\n- Mix uppercase, lowercase, numbers, and symbols\n- Don't use personal information\n- Use different passwords for different accounts\n- Consider using a password manager",
    "To create strong passwords:\n\n1. Aim for 12+ characters\n2. Combine letters, numbers, and symbols\n3. Avoid dictionary words\n4. Don't reuse passwords\n5. Update them regularly\n6. Use a password manager for convenience and security"
  ],
  phishing: [
    "Phishing is a type of social engineering attack where attackers pose as trusted entities to steal your sensitive information. Look out for:\n\n- Unexpected emails requesting urgent action\n- Suspicious links or attachments\n- Requests for personal information\n- Poor grammar or spelling\n- Mismatched or suspicious URLs\n\nAlways verify the sender before clicking links or providing information.",
    "Phishing attacks try to trick you into revealing sensitive information by impersonating legitimate organizations. Red flags include:\n\n- Urgent requests for action\n- Generic greetings instead of your name\n- Requests for credentials or payment info\n- Suspicious domain names\n- Poor writing quality\n\nWhen in doubt, contact the company directly through official channels."
  ],
  malware: [
    "Malware is malicious software designed to damage or gain unauthorized access to systems. Protect yourself by:\n\n- Using reputable antivirus software\n- Keeping your OS and applications updated\n- Being careful about downloads and attachments\n- Avoiding suspicious websites\n- Regular system scanning and backups",
    "To protect against malware:\n\n- Install and update antivirus/anti-malware software\n- Keep all software patched and updated\n- Use a firewall\n- Only download software from trusted sources\n- Don't click on suspicious links or attachments\n- Back up your data regularly"
  ]
};

const defaultResponses = [
  "That's an interesting cybersecurity question. As a basic AI assistant, I can tell you that this topic is important for maintaining robust security practices. Could you ask something more specific about passwords, phishing, malware, or general cybersecurity best practices?",
  "I'm currently operating in offline mode, but I can still provide basic information about common cybersecurity topics like password security, phishing awareness, and malware protection. Could you specify which area you'd like to learn more about?",
  "While I'm running without backend connectivity, I can still help with fundamental cybersecurity concepts. My knowledge covers topics like secure authentication, threat recognition, and data protection. What specific aspect are you interested in?"
];

export function getMockResponse(message) {
  const lowercaseMsg = message.toLowerCase();
  let responseCategory = 'default';
  
  if (lowercaseMsg.includes('hello') || lowercaseMsg.includes('hi ') || lowercaseMsg.includes('hey')) {
    responseCategory = 'greeting';
  } else if (lowercaseMsg.includes('password')) {
    responseCategory = 'password';
  } else if (lowercaseMsg.includes('phishing')) {
    responseCategory = 'phishing';
  } else if (lowercaseMsg.includes('malware') || lowercaseMsg.includes('virus')) {
    responseCategory = 'malware';
  }
  
  const responses = mockResponses[responseCategory] || defaultResponses;
  const randomIndex = Math.floor(Math.random() * responses.// filepath: c:\Users\anura\Desktop\cyberguard-platform\src\services\mockAI.js
// src/services/mockAI.js

const mockResponses = {
  greeting: [
    "Hello! I'm CyberGuard AI, your cybersecurity assistant. How can I help you today?",
    "Hi there! I'm here to help with your cybersecurity questions. What would you like to know?",
    "Greetings! I'm your CyberGuard AI assistant. What cybersecurity topic can I assist you with?"
  ],
  password: [
    "Strong passwords are essential for security. Here are some tips:\n\n- Use at least 12 characters\n- Mix uppercase, lowercase, numbers, and symbols\n- Don't use personal information\n- Use different passwords for different accounts\n- Consider using a password manager",
    "To create strong passwords:\n\n1. Aim for 12+ characters\n2. Combine letters, numbers, and symbols\n3. Avoid dictionary words\n4. Don't reuse passwords\n5. Update them regularly\n6. Use a password manager for convenience and security"
  ],
  phishing: [
    "Phishing is a type of social engineering attack where attackers pose as trusted entities to steal your sensitive information. Look out for:\n\n- Unexpected emails requesting urgent action\n- Suspicious links or attachments\n- Requests for personal information\n- Poor grammar or spelling\n- Mismatched or suspicious URLs\n\nAlways verify the sender before clicking links or providing information.",
    "Phishing attacks try to trick you into revealing sensitive information by impersonating legitimate organizations. Red flags include:\n\n- Urgent requests for action\n- Generic greetings instead of your name\n- Requests for credentials or payment info\n- Suspicious domain names\n- Poor writing quality\n\nWhen in doubt, contact the company directly through official channels."
  ],
  malware: [
    "Malware is malicious software designed to damage or gain unauthorized access to systems. Protect yourself by:\n\n- Using reputable antivirus software\n- Keeping your OS and applications updated\n- Being careful about downloads and attachments\n- Avoiding suspicious websites\n- Regular system scanning and backups",
    "To protect against malware:\n\n- Install and update antivirus/anti-malware software\n- Keep all software patched and updated\n- Use a firewall\n- Only download software from trusted sources\n- Don't click on suspicious links or attachments\n- Back up your data regularly"
  ]
};

const defaultResponses = [
  "That's an interesting cybersecurity question. As a basic AI assistant, I can tell you that this topic is important for maintaining robust security practices. Could you ask something more specific about passwords, phishing, malware, or general cybersecurity best practices?",
  "I'm currently operating in offline mode, but I can still provide basic information about common cybersecurity topics like password security, phishing awareness, and malware protection. Could you specify which area you'd like to learn more about?",
  "While I'm running without backend connectivity, I can still help with fundamental cybersecurity concepts. My knowledge covers topics like secure authentication, threat recognition, and data protection. What specific aspect are you interested in?"
];

export function getMockResponse(message) {
  const lowercaseMsg = message.toLowerCase();
  let responseCategory = 'default';
  
  if (lowercaseMsg.includes('hello') || lowercaseMsg.includes('hi ') || lowercaseMsg.includes('hey')) {
    responseCategory = 'greeting';
  } else if (lowercaseMsg.includes('password')) {
    responseCategory = 'password';
  } else if (lowercaseMsg.includes('phishing')) {
    responseCategory = 'phishing';
  } else if (lowercaseMsg.includes('malware') || lowercaseMsg.includes('virus')) {
    responseCategory = 'malware';
  }
  
  const responses = mockResponses[responseCategory] || defaultResponses;
  const randomIndex = Math.floor(Math.random() * responses.