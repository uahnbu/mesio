const questions = [
  {
    text: '1. Any party to an agreement can start an arbitration, called "the _____".',
    answers: [
      'A. Claimant',
      'B. Defendent',
      'C. Referee', 
      'D. None of the answers are correct'
    ],
    answer: 1
  }, {
    text: '2. In which form must the Arbitral Award be?',
    answers: [
      'A. In text message',
      'B. In writing',
      'C. In speech',
      'D. All answers are correct'
    ],
    answer: 2
  }, {
    text: '3. Arbitration is an efficient form of remedy for _____ of disputes and can act as a _____ that indirectly increases the _____ of parties.',
    answers: [
      'A. incentives - settlement - mechanism',
      'B. mechanism - incentives - settlement',
      'C. settlement - mechanism - incentives',
      'D. mechanism - settlement - incentives'
    ],
    answer: 3
  }, {
    text: '4. All of the below are characteristics of arbitration except:',
    answers: [
      'A. Imperativeness, Fairness',
      'B. Expert arbitrators, Transparency',
      'C. Celerity, Clear standard',
      'D. Fast communication, Predictability'
    ],
    answer: 3
  }, {
    text: '5. Which is one of the basic types of arbitration?',
    answers: [
      'A. Adhoc arbitration',
      'B. Privacy arbitration',
      'C. Both A and B are not incorrect',
      'D. This answer is incorrect'
    ],
    answer: 1
  }, {
    text: '6. Which of the follow factors do two parties have to consider when including thr arbitration clause in the agreement?\nI. Confidentiality of the subject matter\nII. Different party nationalities\nIII. Urgency of the matter\nIV. Nature of the contract',
    answers: [
      'A. I and II',
      'B. II and III',
      'C. I and IV',
      'D. All answers are correct'
    ],
    answer: 4
  }, {
    text: '7. A(n) _____ is a judical order that a judgement be enforced.',
    answers: [
      'A. Writ of execution',
      'B. Arbitral tribunal',
      'C. Submission agreement',
      'D. Case law'
    ],
    answer: 1
  }, {
    text: '8. What is the disadvantage of litigation over arbitration for both parties?',
    answers: [
      'A. Litigation is not inconfidential',
      'B. The arbitration process is public while the litigation is not',
      'C. In the litigation, both parties can appeal if they do not aggre with the decision',
      'D. This answer is correct'
    ],
    answer: 4
  }, {
    text: '9. How many factors stated both parties has to consider when selecting an arbitrator?',
    answers: [
      'A. 3',
      'B. 4',
      'C. 1',
      'D. 2'
    ],
    answer: 2
  }, {
    text: '10. Which is not an expertise of an arbitrator?',
    answers: [
      'A. Legal',
      'B. People management',
      'C. Communicative proficiency demonstration',
      'D. None of the answers are correct'
    ],
    answer: 4
  }, {
    text: '11. To which kind of expense do filling fees and hearing fees belong?',
    answers: [
      'A. Arbitrator compensation',
      'B. Arbitrator expenses',
      'C. Administrative fees',
      'D. Other costs'
    ],
    answer: 2
  }, {
    text: '12. If certain information from a witness is presented by documents, then there is no opportunity to cross-examine the _____ of that witness.',
    answers: [
      'A. Faith',
      'B. Reality',
      'C. Testimony',
      'D. Fairness'
    ],
    answer: 3
  }
];

const walls = [
  [0.5, 0.1, 0.5, 0.4],
  [0.5, 0.6, 0.5, 0.9],
  [0.1, 0.5, 0.4, 0.5],
  [0.6, 0.5, 0.9, 0.5],
  [  1, 0.1,   1, 0.4],
  [  1, 0.6,   1, 0.9],
  [0.1,   1, 0.4,   1],
  [0.6,   1, 0.9,   1]
];

module.exports = { questions, walls };