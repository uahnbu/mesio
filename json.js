const questions = [
  {
    text: '1. To avoid problems with contracts that might infringe government regulations, most contracts include?',
    answers: [
      'A. Force majeure clause',
      'B. Partial invalidity clause',
      'C. Government regulations clause',
      'D. None of the answers are correct'],
    answer: 2
  }, {
    text: '2. In case the company’s name is complicated, a short-form follows the first use of the name to save space and reduces the risk of a mistyping. The short-form can be:',
    answers: [
      'A. A specific name',
      'B. A generic description',
      'C. A and B are correct', 
      'D. None of the answers are correct'
    ],
    answer: 3
  }, {
    text: '3. Which law system states that all the documents that predate the contract might have some bearing on that contract?',
    answers: [
      'A. Civil Law',
      'B. Islam Law',
      'C. Common Law',
      'D. Mixed legal systems'
    ],
    answer: 1
  }, {
    text: '4. There are 2 types of termination: Termination for ____ and termination for ____',
    answers: [
      'A. fault; inconvenience',
      'B. fault; convenience',
      'C. default; inconvenience',
      'D. default; convenience'
    ],
    answer: 4
  }, {
    text: '5. Within most Anglo-American jurisdictions, a contract must be:',
    answers: [
      'A. one-sided',
      'B. two-sided',
      'C. three-sided',
      'D. four-sided'
    ],
    answer: 2
  }, {
    text: '6. The purpose of the "Entire Agreement" clause is?',
    answers: [
      'A. Favoritism',
      'B. Clarify',
      'C. Assumption',
      'D. Essentiality'
    ],
    answer: 2
  }, {
    text: '7. Is this statement correct? - “A "notice" is any formal notification required by the contract, for example, notification that a government approval has arrived; notification that one party wants to terminate the contract, or that a defect needs correction”',
    answers: [
      'A. Correct',
      'B. Incorrect',
      'C. True',
      'D. False'
    ],
    answer: 1
  }, {
    text: '8. In a dispute, if the parties cannot agree on a contract language, the judge shall ____',
    answers: [
      'A. Use the judge default language version',
      'B. Use the Buyer language version',
      'C. Use English-language version',
      'D. Decide which one of the versions mentioned in the contract to trust'],
    answer: 4
  }, {
    text: '9. What is the role of a conciliator in a dispute settlement?',
    answers: [
      'A. Suggest a solution',
      'B. Observation',
      'C. Decide the final and enforcable judgement',
      'D. Trusted by a Party to defend for him'],
    answer: 1
  }, {
    text: '10. The Civil Law is also known as:',
    answers: [
      'A. Case Law',
      'B. Common Law',
      'C. People Law',
      'D. Roman Law'
    ],
    answer: 4
  }, {
    text: '11. What is the advantage of litigation over arbitration?',
    answers: [
      'A. Speciality',
      'B. Finality',
      'C. Confidentality',
      'D. Streamlinity'
    ],
    answer: 2
  }, {
    text: '12. The Australian Law follows the ____ family.',
    answers: [
      'A. Continental Law',
      'B. Anglo-American Law',
      'C. Civil Law',
      'D. Roman Law'
    ],
    answer: 2
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