const db = require("../config/db");
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const SAMPLE_QUIZZES = {
  // Network Fundamentals questions
  network_fundamentals: [
    {
      question_text: "What does IP stand for?",
      options: [
        { option_text: "Internet Protocol", is_correct: 1 },
        { option_text: "Internal Processing", is_correct: 0 },
        { option_text: "Integrated Platform", is_correct: 0 },
        { option_text: "Internet Port", is_correct: 0 },
      ],
    },
    {
      question_text: "Which layer of the OSI model handles routing?",
      options: [
        { option_text: "Layer 2 - Data Link", is_correct: 0 },
        { option_text: "Layer 3 - Network", is_correct: 1 },
        { option_text: "Layer 4 - Transport", is_correct: 0 },
        { option_text: "Layer 7 - Application", is_correct: 0 },
      ],
    },
    {
      question_text: "What is the purpose of a subnet mask?",
      options: [
        { option_text: "To mask IP addresses", is_correct: 0 },
        { option_text: "To divide an IP network into subnets", is_correct: 1 },
        { option_text: "To hide network traffic", is_correct: 0 },
        { option_text: "To encrypt data", is_correct: 0 },
      ],
    },
    {
      question_text: "Which of the following is a Class C IP address?",
      options: [
        { option_text: "10.0.0.1", is_correct: 0 },
        { option_text: "172.16.0.1", is_correct: 0 },
        { option_text: "192.168.1.1", is_correct: 1 },
        { option_text: "8.8.8.8 (for Class E)", is_correct: 0 },
      ],
    },
    {
      question_text: "What does TCP stand for?",
      options: [
        { option_text: "Transmission Control Protocol", is_correct: 1 },
        { option_text: "Transfer Communication Port", is_correct: 0 },
        { option_text: "Telecom Control Process", is_correct: 0 },
        { option_text: "Transmitted Code Processing", is_correct: 0 },
      ],
    },
  ],
  // Packet Analysis questions (reuse for other lessons too)
  packet_analysis: [
    {
      question_text: "What is the primary tool used for packet analysis?",
      options: [
        { option_text: "Wireshark", is_correct: 1 },
        { option_text: "Nmap", is_correct: 0 },
        { option_text: "Metasploit", is_correct: 0 },
        { option_text: "Burp Suite", is_correct: 0 },
      ],
    },
    {
      question_text:
        "Which layer of the OSI model does Wireshark primarily analyze?",
      options: [
        { option_text: "Layer 1 - Physical", is_correct: 0 },
        { option_text: "Layer 2-4 - Multiple layers", is_correct: 1 },
        { option_text: "Layer 7 - Application only", is_correct: 0 },
        { option_text: "Only the Network layer", is_correct: 0 },
      ],
    },
    {
      question_text: "What does a packet capture (.pcap) file contain?",
      options: [
        { option_text: "Source code of applications", is_correct: 0 },
        {
          option_text: "Network traffic data including headers and payload",
          is_correct: 1,
        },
        { option_text: "Log files from the operating system", is_correct: 0 },
        { option_text: "Firewall rules", is_correct: 0 },
      ],
    },
  ],
  // Firewall & Security questions
  firewall_security: [
    {
      question_text: "What is the primary purpose of a firewall?",
      options: [
        { option_text: "To block all internet traffic", is_correct: 0 },
        {
          option_text:
            "To monitor and control incoming/outgoing network traffic",
          is_correct: 1,
        },
        { option_text: "To encrypt all data", is_correct: 0 },
        { option_text: "To manage user passwords", is_correct: 0 },
      ],
    },
    {
      question_text: "Which of the following operates at Layer 3-4?",
      options: [
        { option_text: "Packet Filter Firewall", is_correct: 1 },
        { option_text: "Application Gateway", is_correct: 0 },
        { option_text: "Next-Generation Firewall", is_correct: 0 },
        { option_text: "Web Application Firewall", is_correct: 0 },
      ],
    },
    {
      question_text:
        "What is the default action of a firewall (Deny all by default)?",
      options: [
        {
          option_text:
            "Allow all traffic and block specifically denied connections",
          is_correct: 0,
        },
        {
          option_text:
            "Block all traffic except explicitly allowed connections",
          is_correct: 1,
        },
        { option_text: "Allow only encrypted traffic", is_correct: 0 },
        { option_text: "It depends on the vendor", is_correct: 0 },
      ],
    },
  ],
  // VPN & Encryption questions
  vpn_encryption: [
    {
      question_text: "What does VPN stand for?",
      options: [
        { option_text: "Virtual Personal Network", is_correct: 0 },
        { option_text: "Virtual Private Network", is_correct: 1 },
        { option_text: "Virtual Phone Network", is_correct: 0 },
        { option_text: "Virtual Protocol Network", is_correct: 0 },
      ],
    },
    {
      question_text: "Which encryption standard is considered most secure?",
      options: [
        { option_text: "DES (Data Encryption Standard)", is_correct: 0 },
        { option_text: "AES (Advanced Encryption Standard)", is_correct: 1 },
        { option_text: "MD5", is_correct: 0 },
        { option_text: "SHA-1", is_correct: 0 },
      ],
    },
  ],
  // Network Attacks questions
  network_attacks: [
    {
      question_text: "What is a DDoS attack?",
      options: [
        { option_text: "A type of malware", is_correct: 0 },
        {
          option_text:
            "Overwhelming a system with traffic from multiple sources",
          is_correct: 1,
        },
        { option_text: "A password cracking technique", is_correct: 0 },
        {
          option_text: "Unauthorized access to a single system",
          is_correct: 0,
        },
      ],
    },
    {
      question_text: "What is the purpose of an ARP spoofing attack?",
      options: [
        { option_text: "To flood the network with packets", is_correct: 0 },
        {
          option_text: "To associate attacker's MAC with victim's IP address",
          is_correct: 1,
        },
        { option_text: "To crack encryption", is_correct: 0 },
        { option_text: "To steal passwords", is_correct: 0 },
      ],
    },
  ],
};

async function addQuizzesToDatabase() {
  let connection;
  try {
    console.log("🔍 Fetching all lessons from database...");
    const [lessons] = await db.query("SELECT id, title FROM lessons LIMIT 100");

    if (lessons.length === 0) {
      console.log("⚠️  No lessons found. Please add lessons first.");
      return;
    }

    console.log(`✅ Found ${lessons.length} lessons`);

    // Determine quiz type based on lesson title keywords
    function getQuizType(lessonTitle) {
      const title = lessonTitle.toLowerCase();
      if (
        title.includes("fundamental") ||
        title.includes("basics") ||
        title.includes("introduction")
      ) {
        return "network_fundamentals";
      } else if (title.includes("packet") || title.includes("analysis")) {
        return "packet_analysis";
      } else if (
        title.includes("firewall") ||
        title.includes("security") ||
        title.includes("iptables")
      ) {
        return "firewall_security";
      } else if (
        title.includes("vpn") ||
        title.includes("encryption") ||
        title.includes("tunnel")
      ) {
        return "vpn_encryption";
      } else if (title.includes("attack") || title.includes("intrusion")) {
        return "network_attacks";
      }
      // Default to fundamentals for unmatched lessons
      return "network_fundamentals";
    }

    let addedCount = 0;

    for (const lesson of lessons) {
      // Check if lesson already has quiz questions
      const [existingQuestions] = await db.query(
        "SELECT COUNT(*) as count FROM quiz_questions WHERE lesson_id = ?",
        [lesson.id],
      );

      if (existingQuestions[0].count > 0) {
        console.log(
          `⏭️  Lesson "${lesson.title}" already has quizzes, skipping`,
        );
        continue;
      }

      const quizType = getQuizType(lesson.title);
      const questions =
        SAMPLE_QUIZZES[quizType] || SAMPLE_QUIZZES.network_fundamentals;

      console.log(
        `📝 Adding ${questions.length} quiz questions to "${lesson.title}"...`,
      );

      for (let qIndex = 0; qIndex < questions.length; qIndex++) {
        const question = questions[qIndex];

        // Insert question
        const questionOrder = qIndex + 1;
        const [questionResult] = await db.query(
          "INSERT INTO quiz_questions (lesson_id, question_text, question_order) VALUES (?, ?, ?)",
          [lesson.id, question.question_text, questionOrder],
        );

        const questionId = questionResult.insertId;

        // Insert options
        for (const option of question.options) {
          await db.query(
            "INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES (?, ?, ?)",
            [questionId, option.option_text, option.is_correct ? 1 : 0],
          );
        }

        addedCount++;
      }
    }

    console.log(`\n✅ Successfully added ${addedCount} quiz questions!`);
    console.log("🎓 Quizzes are now ready for students to complete.");
  } catch (error) {
    console.error("❌ Error adding quizzes:", error.message);
    process.exit(1);
  }
}

// Run the script
addQuizzesToDatabase();
