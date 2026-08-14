// GATE 2027 Computer Science & Information Technology Syllabus Seed Database
// Source of Truth: https://gate2027.iitm.ac.in/

export const GATE_SYLLABUS = [
  {
    id: 'CN',
    name: 'Computer Networks',
    order: 1,
    targetHours: 60,
    selfRating: 3,
    timeline: { start: '2026-08-14', end: '2026-08-31' },
    sections: [
      {
        name: 'Layering and Switching',
        topics: [
          {
            id: 'CN-1-1',
            name: 'Concept of Layering',
            subtopics: ['OSI Protocol Stack', 'TCP/IP Protocol Stack', 'Layering Principles']
          },
          {
            id: 'CN-1-2',
            name: 'Switching Basics',
            subtopics: ['Packet Switching', 'Circuit Switching', 'Virtual Circuit Switching']
          }
        ]
      },
      {
        name: 'Data Link Layer',
        topics: [
          {
            id: 'CN-2-1',
            name: 'Framing & Error Control',
            subtopics: ['Framing methods', 'Error detection (CRC, Checksum)', 'Parity check']
          },
          {
            id: 'CN-2-2',
            name: 'Medium Access Control',
            subtopics: ['ALOHA', 'CSMA/CD', 'CSMA/CA', 'Token Ring']
          },
          {
            id: 'CN-2-3',
            name: 'Ethernet Bridging',
            subtopics: ['Transparent Bridges', 'Source Routing Bridges', 'Spanning Tree Protocol (STP)']
          }
        ]
      },
      {
        name: 'Network Layer',
        topics: [
          {
            id: 'CN-3-1',
            name: 'IP Addressing & Subnetting',
            subtopics: ['IPv4 addressing', 'Subnetting & Supernetting', 'Classless Inter-Domain Routing (CIDR)', 'Basics of IPv6']
          },
          {
            id: 'CN-3-2',
            name: 'Routing Protocols',
            subtopics: ['Shortest Path Routing', 'Flooding', 'Distance Vector Routing', 'Link State Routing (OSPF)']
          },
          {
            id: 'CN-3-3',
            name: 'IP Support Protocols',
            subtopics: ['Fragmentation & Reassembly', 'Address Resolution Protocol (ARP)', 'Dynamic Host Configuration Protocol (DHCP)', 'Network Address Translation (NAT)']
          }
        ]
      },
      {
        name: 'Transport & Application Layers',
        topics: [
          {
            id: 'CN-4-1',
            name: 'Transport Layer Protocols',
            subtopics: ['User Datagram Protocol (UDP)', 'Transmission Control Protocol (TCP)', 'Connection Management', 'Flow Control (Sliding Window)', 'Error Control', 'Congestion Control']
          },
          {
            id: 'CN-4-2',
            name: 'Sockets',
            subtopics: ['Socket programming basics', 'Port numbers', 'IP address binding']
          },
          {
            id: 'CN-4-3',
            name: 'Application Layer Protocols',
            subtopics: ['Hypertext Transfer Protocol (HTTP)', 'Domain Name System (DNS)', 'Simple Mail Transfer Protocol (SMTP)', 'Post Office Protocol (POP)', 'File Transfer Protocol (FTP)']
          }
        ]
      }
    ]
  },
  {
    id: 'OS',
    name: 'Operating Systems',
    order: 2,
    targetHours: 50,
    selfRating: 3,
    timeline: { start: '2026-09-01', end: '2026-09-07' },
    sections: [
      {
        name: 'Processes and Threads',
        topics: [
          {
            id: 'OS-1-1',
            name: 'Process Management',
            subtopics: ['Process States', 'Process Control Block (PCB)', 'System Calls', 'Context Switching']
          },
          {
            id: 'OS-1-2',
            name: 'Threads & IPC',
            subtopics: ['User and Kernel Threads', 'Inter-process Communication (IPC)', 'Shared Memory', 'Message Passing']
          }
        ]
      },
      {
        name: 'CPU Scheduling',
        topics: [
          {
            id: 'OS-2-1',
            name: 'Scheduling Algorithms',
            subtopics: ['First-Come First-Served (FCFS)', 'Shortest Job First (SJF)', 'Round Robin (RR)', 'Priority Scheduling', 'Multi-level Queue Scheduling']
          }
        ]
      },
      {
        name: 'Concurrency and Synchronization',
        topics: [
          {
            id: 'OS-3-1',
            name: 'Synchronization Mechanisms',
            subtopics: ['Critical Section Problem', 'Peterson\'s Solution', 'Semaphores', 'Monitors', 'Classic Problems (Producer-Consumer, Reader-Writer, Dining Philosophers)']
          }
        ]
      },
      {
        name: 'Deadlocks',
        topics: [
          {
            id: 'OS-4-1',
            name: 'Deadlock Handling',
            subtopics: ['Deadlock Characterization', 'Prevention', 'Avoidance (Banker\'s Algorithm)', 'Detection and Recovery']
          }
        ]
      },
      {
        name: 'Memory Management',
        topics: [
          {
            id: 'OS-5-1',
            name: 'Physical & Virtual Memory',
            subtopics: ['Contiguous Allocation', 'Paging', 'Segmentation', 'Demand Paging', 'Virtual Memory Concepts']
          },
          {
            id: 'OS-5-2',
            name: 'Page Replacement Algorithms',
            subtopics: ['FIFO Page Replacement', 'Optimal Page Replacement', 'Least Recently Used (LRU)', 'Thrashing & Working Set Model']
          }
        ]
      },
      {
        name: 'Storage & Files',
        topics: [
          {
            id: 'OS-6-1',
            name: 'File Systems',
            subtopics: ['File access and allocation methods', 'Directory structure', 'Free space management']
          },
          {
            id: 'OS-6-2',
            name: 'I/O & Disk Scheduling',
            subtopics: ['Disk scheduling algorithms (FCFS, SSTF, SCAN, LOOK)', 'I/O hardware', 'Interrupts']
          }
        ]
      }
    ]
  },
  {
    id: 'DBMS',
    name: 'Databases',
    order: 3,
    targetHours: 45,
    selfRating: 3,
    timeline: { start: '2026-09-08', end: '2026-09-25' },
    sections: [
      {
        name: 'Database Design',
        topics: [
          {
            id: 'DB-1-1',
            name: 'ER-Model',
            subtopics: ['Entities and Attributes', 'Relationships', 'Constraints', 'ER Diagrams to Relational Schema']
          }
        ]
      },
      {
        name: 'Relational Model & Languages',
        topics: [
          {
            id: 'DB-2-1',
            name: 'Relational Algebra',
            subtopics: ['Selection and Projection', 'Set Operations', 'Joins (Inner, Outer, Self)', 'Division Operator']
          },
          {
            id: 'DB-2-2',
            name: 'Tuple Calculus',
            subtopics: ['Tuple Relational Calculus (TRC)', 'Domain Relational Calculus (DRC)', 'Expressive Power']
          },
          {
            id: 'DB-2-3',
            name: 'Structured Query Language (SQL)',
            subtopics: ['DDL and DML Commands', 'Subqueries & Nested Queries', 'Aggregate Functions', 'Group By & Having', 'Integrity Constraints']
          }
        ]
      },
      {
        name: 'Normalization',
        topics: [
          {
            id: 'DB-3-1',
            name: 'Functional Dependencies',
            subtopics: ['Attribute Closure', 'Canonical Cover', 'Lossless Join Decomposition', 'Dependency Preservation']
          },
          {
            id: 'DB-3-2',
            name: 'Normal Forms',
            subtopics: ['First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'Boyce-Codd Normal Form (BCNF)']
          }
        ]
      },
      {
        name: 'Storage, Indexing & Concurrency',
        topics: [
          {
            id: 'DB-4-1',
            name: 'File Organization & Indexing',
            subtopics: ['Primary and Secondary Indexing', 'B-Trees', 'B+ Trees', 'Hashing']
          },
          {
            id: 'DB-4-2',
            name: 'Transactions & Concurrency Control',
            subtopics: ['ACID Properties', 'Serializability (Conflict & View)', 'Locking Protocols (2PL, Strict 2PL)', 'Timestamp Ordering', 'Deadlock in Transactions']
          }
        ]
      }
    ]
  },
  {
    id: 'CD',
    name: 'Compiler Design',
    order: 4,
    targetHours: 65,
    selfRating: 0,
    timeline: { start: '2026-09-26', end: '2026-10-20' },
    sections: [
      {
        name: 'Lexical Analysis & Parsing',
        topics: [
          {
            id: 'CD-1-1',
            name: 'Lexical Analysis',
            subtopics: ['Token recognition', 'Regular expressions to DFA', 'Lexical Errors']
          },
          {
            id: 'CD-1-2',
            name: 'Syntax Analysis (Parsing)',
            subtopics: ['Top-down parsing (LL(1))', 'Bottom-up parsing (Shift-Reduce, Operator Precedence)', 'LR parsing (SLR(1), LALR(1), CLR(1))', 'Parser generators']
          }
        ]
      },
      {
        name: 'Translation & Environments',
        topics: [
          {
            id: 'CD-2-1',
            name: 'Syntax-Directed Translation',
            subtopics: ['Synthesized and Inherited attributes', 'S-attributed and L-attributed definitions', 'Evaluation orders']
          },
          {
            id: 'CD-2-2',
            name: 'Runtime Environments',
            subtopics: ['Activation records', 'Storage allocation strategies', 'Scope rules']
          }
        ]
      },
      {
        name: 'Code Generation & Optimization',
        topics: [
          {
            id: 'CD-3-1',
            name: 'Intermediate Code Generation',
            subtopics: ['Three-address code', 'Quadruples and Triples', 'Syntax trees', 'Translation of expressions']
          },
          {
            id: 'CD-3-2',
            name: 'Code Optimization & Generation',
            subtopics: ['Local Optimization', 'Basic Blocks and Flow Graphs', 'Loop optimization', 'Register allocation']
          }
        ]
      }
    ]
  },
  {
    id: 'DLD',
    name: 'Digital Logic Design',
    order: 5,
    targetHours: 35,
    selfRating: 4,
    timeline: { start: '2026-10-21', end: '2026-11-02' },
    sections: [
      {
        name: 'Combinational & Number Representations',
        topics: [
          {
            id: 'DL-1-1',
            name: 'Boolean Algebra & Minimization',
            subtopics: ['Logic Gates', 'Boolean identities', 'Karnaugh Maps (K-maps)', 'Tabular method (Quine-McCluskey)']
          },
          {
            id: 'DL-1-2',
            name: 'Combinational Circuits',
            subtopics: ['Arithmetic circuits (Adders, Subtractors)', 'Multiplexers & Demultiplexers', 'Decoders & Encoders', 'Code Converters']
          },
          {
            id: 'DL-1-3',
            name: 'Number Representation',
            subtopics: ['Fixed-point representation', 'Floating-point representation (IEEE 754)', 'Signed numbers (1\'s & 2\'s complement)']
          }
        ]
      },
      {
        name: 'Sequential Circuits',
        topics: [
          {
            id: 'DL-2-1',
            name: 'Latches & Flip-flops',
            subtopics: ['SR Latch', 'SR, JK, D, T Flip-flops', 'Triggering methods', 'Master-Slave configuration']
          },
          {
            id: 'DL-2-2',
            name: 'Registers & Counters',
            subtopics: ['Shift Registers', 'Asynchronous (Ripple) Counters', 'Synchronous Counters', 'Ring & Johnson Counters', 'State tables & State reduction']
          }
        ]
      }
    ]
  },
  {
    id: 'CO',
    name: 'Computer Organization',
    order: 6,
    targetHours: 55,
    selfRating: 4,
    timeline: { start: '2026-11-03', end: '2026-11-16' },
    sections: [
      {
        name: 'Instruction Set & CPU Design',
        topics: [
          {
            id: 'CO-1-1',
            name: 'Instructions & Addressing',
            subtopics: ['Instruction cycles', 'Addressing modes (Direct, Indirect, Register, Indexed)', 'CISC vs RISC architectures']
          },
          {
            id: 'CO-1-2',
            name: 'ALU and Control Unit',
            subtopics: ['Data-path design', 'Hardwired Control Unit', 'Microprogrammed Control Unit']
          }
        ]
      },
      {
        name: 'Pipelining & Memory Hierarchy',
        topics: [
          {
            id: 'CO-2-1',
            name: 'Instruction Pipelining',
            subtopics: ['Pipeline stages', 'Hazards (Structural, Data, Control)', 'Hazard mitigation (Forwarding, Branch Prediction)', 'Performance speedup']
          },
          {
            id: 'CO-2-2',
            name: 'Memory Hierarchy',
            subtopics: ['Cache Mapping (Direct, Associative, Set-Associative)', 'Cache write policies', 'Main memory & Virtual Memory', 'Cache replacement algorithms']
          }
        ]
      },
      {
        name: 'Input/Output Interfaces',
        topics: [
          {
            id: 'CO-3-1',
            name: 'I/O Interface & Data Transfer',
            subtopics: ['Programmed I/O', 'Interrupt-driven I/O', 'Direct Memory Access (DMA)', 'Bus architectures']
          }
        ]
      }
    ]
  },
  {
    id: 'DSA',
    name: 'DSA (Data Structures & C)',
    order: 7,
    targetHours: 50,
    selfRating: 3,
    timeline: { start: '2026-12-08', end: '2026-12-21' },
    sections: [
      {
        name: 'Programming in C',
        topics: [
          {
            id: 'DS-1-1',
            name: 'C Programming Basics',
            subtopics: ['Data Types & Operators', 'Control Flow (loops, conditionals)', 'Functions & Scope', 'Pointers & Memory Allocation', 'Structures & Unions']
          },
          {
            id: 'DS-1-2',
            name: 'Recursion',
            subtopics: ['Recursive functions', 'Call stacks', 'Tail recursion']
          }
        ]
      },
      {
        name: 'Linear Data Structures',
        topics: [
          {
            id: 'DS-2-1',
            name: 'Arrays, Stacks & Queues',
            subtopics: ['Array representations', 'Stack operations & applications', 'Queue variations (Double-ended, Priority)']
          },
          {
            id: 'DS-2-2',
            name: 'Linked Lists',
            subtopics: ['Singly linked lists', 'Doubly linked lists', 'Circular linked lists']
          }
        ]
      },
      {
        name: 'Non-Linear Data Structures',
        topics: [
          {
            id: 'DS-3-1',
            name: 'Trees & Heaps',
            subtopics: ['Binary Trees', 'Binary Search Trees (BST)', 'AVL Trees', 'Binary Heaps (Max/Min Heaps)']
          },
          {
            id: 'DS-3-2',
            name: 'Graphs',
            subtopics: ['Adjacency Matrix', 'Adjacency List', 'Graph Traversal basics']
          }
        ]
      }
    ]
  },
  {
    id: 'DAA',
    name: 'Design & Analysis of Algorithms',
    order: 8,
    targetHours: 60,
    selfRating: 3,
    timeline: { start: '2026-12-22', end: '2027-01-04' },
    sections: [
      {
        name: 'Complexity & Basic Algorithms',
        topics: [
          {
            id: 'AL-1-1',
            name: 'Asymptotic Analysis',
            subtopics: ['Big-Oh, Omega, Theta notations', 'Recurrence relations', 'Master Theorem']
          },
          {
            id: 'AL-1-2',
            name: 'Searching, Sorting & Hashing',
            subtopics: ['Binary Search', 'Sorting (Merge, Quick, Heap, Bubble, Insertion)', 'Hash Tables & Collision Resolution']
          }
        ]
      },
      {
        name: 'Design Techniques',
        topics: [
          {
            id: 'AL-2-1',
            name: 'Greedy & Divide-and-Conquer',
            subtopics: ['Divide and Conquer (Merge sort, Quick sort)', 'Greedy method (Huffman coding, Fractional Knapsack)']
          },
          {
            id: 'AL-2-2',
            name: 'Dynamic Programming',
            subtopics: ['Matrix Chain Multiplication', 'Longest Common Subsequence (LCS)', '0/1 Knapsack']
          }
        ]
      },
      {
        name: 'Graph Algorithms',
        topics: [
          {
            id: 'AL-3-1',
            name: 'Traversals & Shortest Paths',
            subtopics: ['Breadth-First Search (BFS)', 'Depth-First Search (DFS)', 'Dijkstra\'s Shortest Path Algorithm', 'Bellman-Ford Algorithm']
          },
          {
            id: 'AL-3-2',
            name: 'Minimum Spanning Trees',
            subtopics: ['Kruskal\'s Algorithm', 'Prim\'s Algorithm', 'Union-Find data structure']
          }
        ]
      }
    ]
  },
  {
    id: 'TOC',
    name: 'Theory of Computation',
    order: 9,
    targetHours: 50,
    selfRating: 3,
    timeline: { start: '2027-01-05', end: '2027-01-18' },
    sections: [
      {
        name: 'Regular Languages and Automata',
        topics: [
          {
            id: 'TC-1-1',
            name: 'Finite Automata',
            subtopics: ['Deterministic Finite Automata (DFA)', 'Nondeterministic Finite Automata (NFA)', 'Regular Expressions', 'Equivalence of NFA/DFA']
          },
          {
            id: 'TC-1-2',
            name: 'Regular Grammars & Languages',
            subtopics: ['Pumping Lemma for Regular Languages', 'Closure properties of Regular Languages', 'Minimization of DFA']
          }
        ]
      },
      {
        name: 'Context-Free Languages & Pushdown Automata',
        topics: [
          {
            id: 'TC-2-1',
            name: 'Context-Free Grammars',
            subtopics: ['Context-Free Grammars (CFG)', 'Ambiguity in CFGs', 'Chomsky Normal Form (CNF)']
          },
          {
            id: 'TC-2-2',
            name: 'Pushdown Automata',
            subtopics: ['Deterministic and Non-deterministic PDA', 'Equivalence of CFG and PDA', 'Pumping Lemma for CFLs', 'Closure properties of CFLs']
          }
        ]
      },
      {
        name: 'Turing Machines & Decidability',
        topics: [
          {
            id: 'TC-3-1',
            name: 'Turing Machines',
            subtopics: ['TM as language recognizer', 'Recursive and Recursively Enumerable languages', 'Closure properties']
          },
          {
            id: 'TC-3-2',
            name: 'Undecidability',
            subtopics: ['Halting Problem', 'Diagonalization Language', 'Post Correspondence Problem (PCP)', 'Rice\'s Theorem']
          }
        ]
      }
    ]
  },
  {
    id: 'EM',
    name: 'Engineering Mathematics',
    order: 10,
    targetHours: 40,
    selfRating: 5,
    timeline: { start: '2027-01-19', end: '2027-01-25' },
    sections: [
      {
        name: 'Discrete Mathematics',
        topics: [
          {
            id: 'EM-1-1',
            name: 'Mathematical Logic',
            subtopics: ['Propositional Logic', 'First-Order Logic', 'Rules of Inference']
          },
          {
            id: 'EM-1-2',
            name: 'Sets, Relations and Functions',
            subtopics: ['Set Operations', 'Equivalence Relations', 'Partial Orders', 'Lattices', 'Groups']
          },
          {
            id: 'EM-1-3',
            name: 'Combinatorics',
            subtopics: ['Permutations & Combinations', 'Generating Functions', 'Recurrence Relations', 'Pigeonhole Principle']
          },
          {
            id: 'EM-1-4',
            name: 'Graph Theory',
            subtopics: ['Connectivity', 'Eularian and Hamiltonian Paths', 'Graph Matching', 'Graph Coloring', 'Trees']
          }
        ]
      },
      {
        name: 'Linear Algebra',
        topics: [
          {
            id: 'EM-2-1',
            name: 'Matrices & Linear Systems',
            subtopics: ['Matrix operations', 'Determinants', 'Systems of Linear Equations']
          },
          {
            id: 'EM-2-2',
            name: 'Vector Spaces & Eigenvalues',
            subtopics: ['Eigenvalues & Eigenvectors', 'Diagonalization', 'LU decomposition']
          }
        ]
      },
      {
        name: 'Calculus',
        topics: [
          {
            id: 'EM-3-1',
            name: 'Calculus Fundamentals',
            subtopics: ['Limits and Continuity', 'Differentiability', 'Mean Value Theorems', 'Maxima and Minima', 'Definite Integrals']
          }
        ]
      },
      {
        name: 'Probability and Statistics',
        topics: [
          {
            id: 'EM-4-1',
            name: 'Probability & Distributions',
            subtopics: ['Conditional Probability', 'Bayes Theorem', 'Random Variables (Discrete & Continuous)', 'Uniform, Normal, Exponential, Poisson, Binomial distributions']
          },
          {
            id: 'EM-4-2',
            name: 'Statistics Fundamentals',
            subtopics: ['Mean, Median, Mode', 'Standard Deviation', 'Correlation and Regression']
          }
        ]
      }
    ]
  },
  {
    id: 'GA',
    name: 'General Aptitude & English',
    order: 11,
    targetHours: 20,
    selfRating: 3,
    timeline: { start: '2026-08-14', end: '2027-01-31' }, // Prepared concurrently
    sections: [
      {
        name: 'Quantitative Aptitude',
        topics: [
          {
            id: 'GA-1-1',
            name: 'Numerical & Arithmetic Aptitude',
            subtopics: ['Ratio & Proportion', 'Percentage', 'Profit, Loss & Interest', 'Averages & Mixtures', 'Time & Work', 'Time & Distance']
          },
          {
            id: 'GA-1-2',
            name: 'Data Interpretation',
            subtopics: ['Bar charts', 'Pie charts', 'Tables & Line Graphs']
          }
        ]
      },
      {
        name: 'Analytical Aptitude',
        topics: [
          {
            id: 'GA-2-1',
            name: 'Logical Reasoning',
            subtopics: ['Deductive & Inductive Logic', 'Puzzles', 'Venn Diagrams', 'Series & Coding-Decoding']
          }
        ]
      },
      {
        name: 'Verbal Aptitude',
        topics: [
          {
            id: 'GA-3-1',
            name: 'English Grammar & Vocabulary',
            subtopics: ['Basic grammar (tenses, prepositions)', 'Vocabulary & Synonyms', 'Sentence Completion']
          },
          {
            id: 'GA-3-2',
            name: 'Reading Comprehension',
            subtopics: ['Paragraph summary', 'Drawing inferences from passages']
          }
        ]
      }
    ]
  }
];
