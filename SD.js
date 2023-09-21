// SD.js
onmessage = function(e) {
	if (e.data === 'generate') {
		const sudoku = generateSudoku(); // 生成数独数组
		postMessage(sudoku); 
	}
  }
  