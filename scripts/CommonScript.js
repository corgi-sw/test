export default script = {
  MessageScript: {
    0: [
      "@@!",
      "오늘 하루 잘 보내고 있어?",
      "**corgi"
    ],
    1: ["그렇구나. 지금 기분은 어때?"],
    2: [
      "@@가 우울하다니 정말 속상하다.",
      "무슨 일 때문에 우울한지 말해줄 수 있어?",
      "나는 유(U)니까 편하게 말해도 괜찮아! 😊"
    ],
    length: 3
  },

  Delay: {
    0: [1000, 1000],
    1: [1000],
    2: [1000, 1000, 1000]
  },

  ButtonScript: {
    0: [
      "응, 좋아! 🥰",
      "그럭저럭 보통이야 🙁",
      "아니, 별로... 😨"
    ],
    1: ["우울해 😨", "불안해 😣", "행복해 🥰"],
    2: ["1", "2", "3"]
  }
};
