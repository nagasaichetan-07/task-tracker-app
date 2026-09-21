// GATE 2027 Computer Science & Information Technology Syllabus Seed Database
// Updated according to GO Classes complete GATE 2027 course schedule & official GATE syllabus
// Filtered out removed topics (Web Tech, Token Ring, Software Engineering, Complex Analysis)
// Custom order: CN (Flow Control -> end), C, DSA, DBMS, OS, DLD, (NOV OFF), CO, DAA, EM, CD, TOC, Aptitude/English

export const GATE_SYLLABUS = [
  {
    id: 'CN',
    name: 'Computer Networks (Flow Control to End)',
    order: 1,
    targetHours: 36,
    selfRating: 3,
    timeline: { start: '2026-09-22', end: '2026-09-27' },
    sections: [
      {
        name: 'Data Link Layer (Flow & Error Control)',
        topics: [
          {
            id: 'CN-1-1',
            name: 'Flow Control Protocols',
            subtopics: ['Stop-and-Wait Protocol', 'Go-Back-N ARQ', 'Selective Repeat ARQ', 'Efficiency & Throughput Calculations']
          },
          {
            id: 'CN-1-2',
            name: 'Error Control & Congestion Control',
            subtopics: ['CRC & Checksum calculations', 'TCP Congestion Control (Slow Start, AIMD)', 'Window Size & Retransmission Timers']
          }
        ]
      },
      {
        name: 'Network Layer',
        topics: [
          {
            id: 'CN-2-1',
            name: 'IP Addressing & Subnetting',
            subtopics: ['IPv4 Addressing', 'Subnetting & Supernetting', 'CIDR notation', 'Subnet Masks & Address Range', 'IPv6 Basics']
          },
          {
            id: 'CN-2-2',
            name: 'Routing Protocols',
            subtopics: ['Shortest Path Routing', 'Distance Vector Routing (RIP)', 'Link State Routing (OSPF)', 'Count to Infinity Problem']
          },
          {
            id: 'CN-2-3',
            name: 'IP Support Protocols',
            subtopics: ['IP Packet Header & Fragmentation', 'Address Resolution Protocol (ARP)', 'DHCP & NAT', 'ICMP Error Reporting']
          }
        ]
      },
      {
        name: 'Transport & Application Layers',
        topics: [
          {
            id: 'CN-3-1',
            name: 'Transport Protocols & Sockets',
            subtopics: ['UDP Header & Features', 'TCP 3-Way Handshake & Connection Termination', 'TCP Segment Format', 'Socket Programming Basics']
          },
          {
            id: 'CN-3-2',
            name: 'Application Layer Protocols',
            subtopics: ['DNS (Domain Name System)', 'HTTP & HTTPS', 'SMTP, POP3, IMAP', 'FTP (File Transfer Protocol)']
          }
        ]
      }
    ]
  },
  {
    id: 'C',
    name: 'C Programming',
    order: 2,
    targetHours: 30,
    selfRating: 4,
    timeline: { start: '2026-09-28', end: '2026-10-02' },
    sections: [
      {
        name: 'C Fundamentals & Control Flow',
        topics: [
          {
            id: 'C-1-1',
            name: 'Data Types, Operators & Precedence',
            subtopics: ['Primitive Data Types', 'Arithmetic, Bitwise, Logical Operators', 'Operator Precedence & Associativity']
          },
          {
            id: 'C-1-2',
            name: 'Control Flow',
            subtopics: ['If-Else Conditionals', 'Switch Case', 'For, While, Do-While Loops', 'Break & Continue']
          }
        ]
      },
      {
        name: 'Functions, Pointers & Memory',
        topics: [
          {
            id: 'C-1-3',
            name: 'Functions & Parameter Passing',
            subtopics: ['Function Declarations', 'Call by Value vs Call by Reference', 'Scope & Lifetime of Variables (static, auto, extern)']
          },
          {
            id: 'C-1-4',
            name: 'Pointers & Memory Management',
            subtopics: ['Pointer Declarations & Dereferencing', 'Pointer Arithmetic', 'Dynamic Memory Allocation (malloc, calloc, realloc, free)']
          },
          {
            id: 'C-1-5',
            name: 'Arrays, Structures & Recursion',
            subtopics: ['1D & 2D Array Pointers', 'Structures & Unions', 'Recursive Functions & Call Stack Analysis']
          }
        ]
      }
    ]
  },
  {
    id: 'DSA',
    name: 'Data Structures',
    order: 3,
    targetHours: 42,
    selfRating: 3,
    timeline: { start: '2026-10-03', end: '2026-10-09' },
    sections: [
      {
        name: 'Linear Data Structures',
        topics: [
          {
            id: 'DSA-1-1',
            name: 'Arrays, Stacks & Infix/Postfix',
            subtopics: ['Array Storage Representation', 'Stack Operations', 'Infix to Postfix/Prefix Conversion', 'Postfix Expression Evaluation']
          },
          {
            id: 'DSA-1-2',
            name: 'Queues & Variations',
            subtopics: ['Linear Queue', 'Circular Queue Implementation', 'Double-Ended Queue (Deque)', 'Priority Queue']
          },
          {
            id: 'DSA-1-3',
            name: 'Linked Lists',
            subtopics: ['Singly Linked List', 'Doubly Linked List', 'Circular Linked List', 'Reversing & Loop Detection']
          }
        ]
      },
      {
        name: 'Non-Linear Data Structures',
        topics: [
          {
            id: 'DSA-2-1',
            name: 'Trees & Binary Search Trees',
            subtopics: ['Binary Tree Properties', 'Tree Traversals (Pre, In, Post, Level-order)', 'BST Insertion, Deletion & Search', 'AVL Trees']
          },
          {
            id: 'DSA-2-2',
            name: 'Heaps & Priority Queues',
            subtopics: ['Binary Max-Heap & Min-Heap', 'Heapify Algorithm', 'HeapSort & Priority Queue Applications']
          },
          {
            id: 'DSA-2-3',
            name: 'Hash Tables',
            subtopics: ['Hash Functions', 'Collision Resolution: Chaining', 'Open Addressing (Linear Probing, Quadratic, Double Hashing)']
          }
        ]
      }
    ]
  },
  {
    id: 'DBMS',
    name: 'Database Management Systems',
    order: 4,
    targetHours: 42,
    selfRating: 3,
    timeline: { start: '2026-10-10', end: '2026-10-16' },
    sections: [
      {
        name: 'Database Design & Relational Model',
        topics: [
          {
            id: 'DB-1-1',
            name: 'ER-Model to Relational Schema',
            subtopics: ['Entities & Attributes', 'Relationship Types & Cardinalities', 'ER Diagram to Relational Tables Reduction']
          },
          {
            id: 'DB-1-2',
            name: 'Relational Algebra',
            subtopics: ['Select, Project, Rename', 'Set Operations', 'Natural Join, Outer Joins', 'Division Operator']
          },
          {
            id: 'DB-1-3',
            name: 'Tuple & Domain Relational Calculus',
            subtopics: ['Tuple Relational Calculus (TRC)', 'Domain Relational Calculus (DRC)', 'Safe Calculus Expressions']
          }
        ]
      },
      {
        name: 'SQL & Normalization',
        topics: [
          {
            id: 'DB-2-1',
            name: 'SQL Queries & Subqueries',
            subtopics: ['DDL & DML Commands', 'Nested Subqueries (IN, EXISTS, ALL, ANY)', 'Aggregate Functions', 'Group By & Having Clauses']
          },
          {
            id: 'DB-2-2',
            name: 'Functional Dependencies & Closure',
            subtopics: ['Attribute Closure', 'Canonical Cover', 'Lossless Join Decomposition', 'Dependency Preservation']
          },
          {
            id: 'DB-2-3',
            name: 'Normal Forms (1NF to BCNF)',
            subtopics: ['1NF, 2NF, 3NF', 'Boyce-Codd Normal Form (BCNF)', 'Decomposition Algorithms']
          }
        ]
      },
      {
        name: 'Indexing & Concurrency Control',
        topics: [
          {
            id: 'DB-3-1',
            name: 'File Indexing & B/B+ Trees',
            subtopics: ['Primary & Secondary Indexing', 'Dense vs Sparse Indexing', 'B-Tree & B+ Tree Node Insertion & Deletion']
          },
          {
            id: 'DB-3-2',
            name: 'Transactions & Concurrency',
            subtopics: ['ACID Properties', 'Conflict & View Serializability', 'Two-Phase Locking (2PL, Strict 2PL)', 'Timestamp Ordering']
          }
        ]
      }
    ]
  },
  {
    id: 'OS',
    name: 'Operating Systems',
    order: 5,
    targetHours: 42,
    selfRating: 3,
    timeline: { start: '2026-10-17', end: '2026-10-23' },
    sections: [
      {
        name: 'Processes, Threads & Scheduling',
        topics: [
          {
            id: 'OS-1-1',
            name: 'Processes & Threads',
            subtopics: ['Process States & PCB', 'System Calls & Context Switching', 'User vs Kernel Threads', 'IPC (Shared Memory, Message Passing)']
          },
          {
            id: 'OS-1-2',
            name: 'CPU Scheduling Algorithms',
            subtopics: ['FCFS, SJF, SRTF', 'Round Robin (Time Quantum impact)', 'Priority Scheduling', 'Gantt Charts & Average Waiting Time']
          }
        ]
      },
      {
        name: 'Concurrency & Deadlocks',
        topics: [
          {
            id: 'OS-2-1',
            name: 'Process Synchronization',
            subtopics: ['Critical Section Problem', 'Peterson\'s Solution', 'Semaphores (Counting & Binary)', 'Producer-Consumer & Reader-Writer Problems']
          },
          {
            id: 'OS-2-2',
            name: 'Deadlock Characterization & Handling',
            subtopics: ['4 Necessary Conditions for Deadlock', 'Resource Allocation Graph', 'Deadlock Prevention', 'Banker\'s Algorithm for Avoidance']
          }
        ]
      },
      {
        name: 'Memory Management & File Systems',
        topics: [
          {
            id: 'OS-3-1',
            name: 'Paging & Virtual Memory',
            subtopics: ['Paging & Page Table Structure', 'Multi-Level Paging & TLB', 'Demand Paging & Page Fault Rate']
          },
          {
            id: 'OS-3-2',
            name: 'Page Replacement & Disk Scheduling',
            subtopics: ['FIFO, Optimal, LRU Replacement', 'Belady\'s Anomaly & Thrashing', 'Disk Scheduling (FCFS, SSTF, SCAN, LOOK, C-SCAN)']
          }
        ]
      }
    ]
  },
  {
    id: 'DLD',
    name: 'Digital Logic Design',
    order: 6,
    targetHours: 42,
    selfRating: 4,
    timeline: { start: '2026-10-24', end: '2026-10-30' },
    sections: [
      {
        name: 'Combinational Logic',
        topics: [
          {
            id: 'DL-1-1',
            name: 'Boolean Algebra & K-Maps',
            subtopics: ['Boolean Postulates & Theorems', 'SOP & POS Form', 'Karnaugh Maps (K-Maps)', 'Don\'t Care Conditions', 'Implicants & Essential Prime Implicants']
          },
          {
            id: 'DL-1-2',
            name: 'Combinational Circuits',
            subtopics: ['Half & Full Adders', 'Lookahead Carry Adder', 'Multiplexers (MUX) & Demultiplexers', 'Decoders & Encoders']
          },
          {
            id: 'DL-1-3',
            name: 'Number Representation',
            subtopics: ['Fixed-Point Representation', '1\'s & 2\'s Complement Arithmetic', 'IEEE 754 Floating Point Format (Single & Double Precision)']
          }
        ]
      },
      {
        name: 'Sequential Logic',
        topics: [
          {
            id: 'DL-2-1',
            name: 'Latches & Flip-Flops',
            subtopics: ['SR Latch', 'JK, D, T Flip-Flops', 'Master-Slave Flip-Flops', 'Excitation Tables & Conversion']
          },
          {
            id: 'DL-2-2',
            name: 'Registers & Counters',
            subtopics: ['Shift Registers (SISO, SIPO, PISO, PIPO)', 'Asynchronous/Ripple Counters', 'Synchronous Counters', 'Mod-N Counters, Ring & Johnson Counters']
          }
        ]
      }
    ]
  },
  {
    id: 'CO',
    name: 'Computer Organization & Architecture',
    order: 7,
    targetHours: 42,
    selfRating: 4,
    timeline: { start: '2026-12-01', end: '2026-12-07' },
    sections: [
      {
        name: 'CPU Design & Addressing Modes',
        topics: [
          {
            id: 'CO-1-1',
            name: 'Machine Instructions & Addressing Modes',
            subtopics: ['Instruction Cycle', 'Addressing Modes (Immediate, Direct, Indirect, Register, Indexed, PC-Relative)']
          },
          {
            id: 'CO-1-2',
            name: 'ALU & Control Unit Design',
            subtopics: ['Data-path Architecture', 'Hardwired Control Unit', 'Microprogrammed Control Unit (Microinstructions, Control Memory)']
          }
        ]
      },
      {
        name: 'Pipelining & Memory Hierarchy',
        topics: [
          {
            id: 'CO-2-1',
            name: 'Instruction Pipelining & Hazards',
            subtopics: ['Pipeline Stages & Execution', 'Structural, Data, Control Hazards', 'Operand Forwarding & Branch Prediction', 'Speedup & Throughput Calculations']
          },
          {
            id: 'CO-2-2',
            name: 'Memory Hierarchy & Cache Mapping',
            subtopics: ['Direct Mapping, Associative Mapping, Set-Associative Mapping', 'Cache Misses & Hit Ratio', 'Write-Through vs Write-Back Policies']
          },
          {
            id: 'CO-2-3',
            name: 'I/O Data Transfer',
            subtopics: ['Programmed I/O', 'Interrupt-Driven I/O', 'Direct Memory Access (DMA)']
          }
        ]
      }
    ]
  },
  {
    id: 'DAA',
    name: 'Design & Analysis of Algorithms',
    order: 8,
    targetHours: 42,
    selfRating: 3,
    timeline: { start: '2026-12-08', end: '2026-12-14' },
    sections: [
      {
        name: 'Analysis & Sorting',
        topics: [
          {
            id: 'AL-1-1',
            name: 'Asymptotic Analysis & Recurrences',
            subtopics: ['Big-O, Omega, Theta Notations', 'Master Theorem', 'Substitution & Recurrence Tree Methods']
          },
          {
            id: 'AL-1-2',
            name: 'Searching & Sorting Algorithms',
            subtopics: ['Binary Search', 'MergeSort & QuickSort Complexity', 'HeapSort & RadixSort']
          }
        ]
      },
      {
        name: 'Algorithm Design Strategies',
        topics: [
          {
            id: 'AL-2-1',
            name: 'Greedy Algorithms & MST',
            subtopics: ['Fractional Knapsack', 'Huffman Coding', 'Kruskal\'s & Prim\'s Minimum Spanning Tree Algorithms']
          },
          {
            id: 'AL-2-2',
            name: 'Dynamic Programming',
            subtopics: ['0/1 Knapsack Problem', 'Matrix Chain Multiplication', 'Longest Common Subsequence (LCS)', 'Bellman-Ford Algorithm']
          },
          {
            id: 'AL-2-3',
            name: 'Graph Algorithms & NP-Completeness',
            subtopics: ['BFS & DFS Traversals', 'Dijkstra\'s Shortest Path Algorithm', 'Topological Sort', 'P, NP, NP-Hard, NP-Complete Definitions']
          }
        ]
      }
    ]
  },
  {
    id: 'EM',
    name: 'Engineering & Discrete Mathematics',
    order: 9,
    targetHours: 54,
    selfRating: 4,
    timeline: { start: '2026-12-15', end: '2026-12-23' },
    sections: [
      {
        name: 'Discrete Mathematics',
        topics: [
          {
            id: 'EM-1-1',
            name: 'Propositional & Predicate Logic',
            subtopics: ['Logical Connectives & Truth Tables', 'First-Order Predicates & Quantifiers', 'Rules of Inference']
          },
          {
            id: 'EM-1-2',
            name: 'Sets, Relations, Functions & Lattices',
            subtopics: ['Equivalence Relations & Partitions', 'Partial Orders & Hasse Diagrams', 'Lattices & Groups']
          },
          {
            id: 'EM-1-3',
            name: 'Combinatorics & Graph Theory',
            subtopics: ['Permutations & Combinations', 'Pigeonhole Principle', 'Eulerian & Hamiltonian Graphs', 'Graph Coloring & Planarity']
          }
        ]
      },
      {
        name: 'Linear Algebra',
        topics: [
          {
            id: 'EM-2-1',
            name: 'Matrices & Linear Systems',
            subtopics: ['Determinants & Matrix Rank', 'Systems of Linear Equations (Ax = b)', 'Eigenvalues & Eigenvectors', 'LU Decomposition']
          }
        ]
      },
      {
        name: 'Calculus',
        topics: [
          {
            id: 'EM-3-1',
            name: 'Limits, Calculus & Maxima/Minima',
            subtopics: ['Limits, Continuity & Differentiability', 'Mean Value Theorems', 'Definite Integrals & Maxima/Minima']
          }
        ]
      },
      {
        name: 'Probability & Statistics',
        topics: [
          {
            id: 'EM-4-1',
            name: 'Probability & Random Variables',
            subtopics: ['Conditional Probability & Bayes Theorem', 'Discrete & Continuous Random Variables', 'Uniform, Normal, Exponential, Poisson, Binomial Distributions']
          }
        ]
      }
    ]
  },
  {
    id: 'CD',
    name: 'Compiler Design',
    order: 10,
    targetHours: 36,
    selfRating: 3,
    timeline: { start: '2026-12-24', end: '2026-12-29' },
    sections: [
      {
        name: 'Lexical & Syntax Analysis',
        topics: [
          {
            id: 'CD-1-1',
            name: 'Lexical Analysis & DFA',
            subtopics: ['Regular Expressions to NFA/DFA', 'Lexical Analyzer Generator Concepts']
          },
          {
            id: 'CD-1-2',
            name: 'Syntax Analysis & Parsing',
            subtopics: ['Context-Free Grammars', 'Top-Down LL(1) Parsing (FIRST & FOLLOW)', 'Bottom-Up LR Parsing (SLR(1), LALR(1), CLR(1))']
          }
        ]
      },
      {
        name: 'Translation & Optimization',
        topics: [
          {
            id: 'CD-2-1',
            name: 'Syntax-Directed Translation & ICG',
            subtopics: ['S-attributed & L-attributed SDDs', 'Three-Address Code Generation']
          },
          {
            id: 'CD-2-2',
            name: 'Runtime Environments & Optimization',
            subtopics: ['Activation Records & Parameter Passing', 'Basic Blocks & Flow Graphs', 'Code Optimization Techniques']
          }
        ]
      }
    ]
  },
  {
    id: 'TOC',
    name: 'Theory of Computation',
    order: 11,
    targetHours: 42,
    selfRating: 3,
    timeline: { start: '2026-12-30', end: '2027-01-05' },
    sections: [
      {
        name: 'Automata & Regular Languages',
        topics: [
          {
            id: 'TC-1-1',
            name: 'Finite Automata & Regular Expressions',
            subtopics: ['DFA, NFA, NFA to DFA Equivalence', 'Regular Expression Properties', 'DFA Minimization']
          },
          {
            id: 'TC-1-2',
            name: 'Pumping Lemma & Closure Properties',
            subtopics: ['Pumping Lemma for Regular Languages', 'Closure Properties of Regular & Context-Free Languages']
          }
        ]
      },
      {
        name: 'Grammars, PDA & Decidability',
        topics: [
          {
            id: 'TC-2-1',
            name: 'Context-Free Grammars & PDA',
            subtopics: ['Ambiguous Grammars & CNF', 'Pushdown Automata (DPDA vs NPDA)', 'Equivalence of CFG & PDA']
          },
          {
            id: 'TC-2-2',
            name: 'Turing Machines & Undecidability',
            subtopics: ['Turing Machine Definition & Design', 'Recursive vs R.E. Languages', 'Halting Problem & Undecidability Reductions']
          }
        ]
      }
    ]
  },
  {
    id: 'GA',
    name: 'General Aptitude & English',
    order: 12,
    targetHours: 30,
    selfRating: 4,
    timeline: { start: '2026-09-22', end: '2027-01-07' },
    sections: [
      {
        name: 'Quantitative Aptitude & Logic',
        topics: [
          {
            id: 'GA-1-1',
            name: 'Numerical Aptitude & Reasoning',
            subtopics: ['Ratios, Percentages, Profit & Loss', 'Time & Work, Speed & Distance', 'Data Interpretation (Charts & Tables)']
          }
        ]
      },
      {
        name: 'Verbal Aptitude',
        topics: [
          {
            id: 'GA-2-1',
            name: 'English Grammar & Comprehension',
            subtopics: ['Basic English Grammar & Tenses', 'Vocabulary & Sentence Completion', 'Reading Comprehension & Inferences']
          }
        ]
      }
    ]
  }
];
