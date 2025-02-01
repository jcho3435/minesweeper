import React, { Component } from "react";
import * as d3 from "d3";
import "./GameBoard.css";

class GameBoard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mines: this.props.mines,
    };
  }

  componentDidMount() {
    if (
      this.props.width !== null &&
      this.props.height != null &&
      this.props.mines != null
    )
      this.loadNewBoard();
  }

  componentDidUpdate(prevProps) {
    if (this.props.generated !== prevProps.generated) this.loadNewBoard();
  }

  loadNewBoard = () => {
    console.log("loadNew");
    this.setState({ mines: this.props.mines });

    var margin = { left: 20, right: 20, top: 20, bottom: 20 };

    //display mine count
    this.renderMineCount(this.props.mines, margin);

    //create board
    //create array board, add mines
    var bWidth = this.props.width,
      bHeight = this.props.height;
    var board = new Array(bHeight * bWidth);
    for (var i = 0; i < this.props.mines; i++) board[i] = -1;
    for (i = this.props.mines; i < board.length; i++) board[i] = 0;

    //shuffle mines
    const _ = require("lodash");
    board = _.shuffle(board);

    //convert each element into an object in 2d array
    var board2d = new Array(bHeight);
    for (i = 0; i < board2d.length; i++) board2d[i] = new Array(bWidth);

    for (var r = 0; r < bHeight; r++) {
      for (var c = 0; c < bWidth; c++) {
        var val = board[r * bWidth + c];
        board2d[r][c] = {
          value: val,
          flag: false,
          revealed: false,
          row: r,
          col: c,
        };
      }
    }

    //dealloate board2d
    board = board2d;
    board2d = null;

    //correct board2d values
    for (r = 0; r < bHeight; r++) {
      for (c = 0; c < bWidth; c++) {
        if (board[r][c].value !== -1)
          board[r][c].value = this.getAdjacentMineCount(
            board,
            r,
            c,
            bHeight - 1,
            bWidth - 1
          );
      }
    }

    //handle SVG render
    var boardSvg = d3.select(".board_svg");
    var minecountSvg = d3.select(".mine_count");

    const cellSize = 25;

    boardSvg.attr(
      "width",
      `${cellSize * this.props.width + margin.left + margin.right}px`
    );
    minecountSvg.attr(
      "width",
      `${cellSize * this.props.width + margin.left + margin.right}px`
    );
    boardSvg.attr(
      "height",
      `${cellSize * this.props.height + margin.top + margin.bottom}px`
    );

    // Create board cells
    var data = board.flat();
    const boardSurface = boardSvg
      .selectAll(".boardSurface")
      .data([0])
      .join("g")
      .attr("class", "boardSurface")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    var rects = boardSurface
      .selectAll(".cell")
      .data(data)
      .join("rect")
      .attr("class", "cell")
      .attr("x", (d) => d.col * cellSize)
      .attr("y", (d) => d.row * cellSize)
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("stroke", "black");

    //handle rect fill
    rects.attr("fill", (d) =>
      d.revealed ? (d.value === -1 ? "red" : "lightgray") : "white"
    );

    //handle event
    rects
      .on("click", (e, d) => {
        if (!d.flag && !d.revealed) {
          if (d.value === 0) {
            cascadeReveal(d.row, d.col);
            checkForWin();
          } else {
            d.revealed = true;
            if (d.value === -1) {
              handleLoss();
            } else checkForWin();
          }
        } else if (d.revealed && d.value > 0) {
          handleRevealedCellClick(d.row, d.col, d.value);
        }

        updateBoard();
      })
      .on("contextmenu", (e, d) => {
        e.preventDefault();
        if (!d.revealed) {
          d.flag = !d.flag;
          if (d.flag) {
            this.setState((prevState) => {
              const newMines = prevState.mines - 1;
              this.renderMineCount(newMines, margin); // Update the mine count display
              return { mines: newMines };
            });
          } else {
            this.setState((prevState) => {
              const newMines = prevState.mines + 1;
              this.renderMineCount(newMines, margin); // Update the mine count display
              return { mines: newMines };
            });
          }
        }
        updateBoard();
      });

    //add text for numbers
    boardSurface
      .selectAll("text")
      .data(board.flat())
      .join("text")
      .attr("x", (d) => d.col * cellSize + cellSize / 2)
      .attr("y", (d) => d.row * cellSize + 2 + cellSize / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "16px")
      .attr("fill", "black")
      .text((d) => (d.revealed && d.value > 0 ? d.value : d.flag ? "🚩" : ""));

    //function to update board after clicks
    const updateBoard = () => {
      //update the cell colors based on revealed status
      rects
        .transition()
        .duration(100)
        .attr("fill", (d) =>
          d.revealed ? (d.value === -1 ? "red" : "lightgray") : "white"
        );

      //update the text visibility
      boardSurface
        .selectAll("text")
        .text((d) =>
          d.revealed && d.value > 0 ? d.value : d.flag ? "🚩" : ""
        );
    };

    //function for cascading reveal
    const cascadeReveal = (r, c) => {
      var queue = [[r, c]];

      while (queue.length > 0) {
        const [row, col] = queue.shift();

        if (board[row][col].revealed || board[row][col].flag) continue;

        board[row][col].revealed = true;

        if (board[row][col].value === 0) {
          for (
            var i = Math.max(0, row - 1);
            i <= Math.min(bHeight - 1, row + 1);
            i++
          ) {
            for (
              var j = Math.max(0, col - 1);
              j <= Math.min(bWidth - 1, col + 1);
              j++
            ) {
              if (!(i === row && j === col)) {
                queue.push([i, j]);
              }
            }
          }
        }
      }

      updateBoard();
    };

    const handleLoss = () => {
      minecountSvg
        .selectAll("text")
        .data([0])
        .join("text")
        .attr(
          "x",
          (cellSize * this.props.width + margin.left + margin.right) / 2
        )
        .attr("y", 25)
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "middle")
        .text(`Game Over`)
        .attr("font-size", 20)
        .attr("fill", "darkred");

      rects.on("click", null).on("contextmenu", null);
    };

    const checkForWin = () => {
      var won = true;
      for (var i = 0; i < data.length; i++) {
        if (data[i].value !== -1 && !data[i].revealed) {
          won = false;
          break;
        }
      }

      if (won) {
        minecountSvg
          .selectAll("text")
          .data([0])
          .join("text")
          .attr(
            "x",
            (cellSize * this.props.width + margin.left + margin.right) / 2
          )
          .attr("y", 25)
          .attr("dominant-baseline", "middle")
          .attr("text-anchor", "middle")
          .text(`You win!`)
          .attr("font-size", 20)
          .attr("fill", "green");

        for (i = 0; i < data.length; i++)
          if (data[i].value === -1) data[i].flag = true;

        rects.on("click", null).on("contextmenu", null);
      }
    };

    const handleRevealedCellClick = (r, c, val) => {
      //check for flags
      var flagCount = 0;

      for (
        var row = Math.max(0, r - 1);
        row <= Math.min(this.props.height - 1, r + 1);
        row++
      ) {
        for (
          var col = Math.max(0, c - 1);
          col <= Math.min(this.props.width - 1, c + 1);
          col++
        ) {
          if (row === r && col === c) continue;
          if (board[row][col].flag) flagCount++;
        }
      }

      // if condition is met, reveal all adjacent tiles
      var hitBomb = false;
      if (flagCount >= val) {
        for (
          row = Math.max(0, r - 1);
          row <= Math.min(this.props.height - 1, r + 1);
          row++
        ) {
          for (
            col = Math.max(0, c - 1);
            col <= Math.min(this.props.width - 1, c + 1);
            col++
          ) {
            if (row === r && col === c) continue;
            if (!board[row][col].flag) {
              val = board[row][col].value;
              if (val !== 0) {
                board[row][col].revealed = true;
                if (val === -1) {
                  hitBomb = true;
                }
              } else {
                cascadeReveal(row, col);
              }
            }
          }
        }
      }
      if (hitBomb) handleLoss();
      else checkForWin();
    };
  };

  renderMineCount = (count, margin) => {
    var minecountSvg = d3.select(".mine_count");
    minecountSvg
      .selectAll("text")
      .data([0])
      .join("text")
      .attr("x", margin.left)
      .attr("y", 25)
      .attr("dominant-baseline", "middle")
      .text(`Mine Count: ${count}`)
      .attr("fill", "white")
      .attr("font-size", 16)
      .attr("text-anchor", "auto");
  };

  getAdjacentMineCount = (board, r, c, maxR, maxC) => {
    var adjCount = 0;

    for (var row = Math.max(0, r - 1); row <= Math.min(maxR, r + 1); row++) {
      for (var col = Math.max(0, c - 1); col <= Math.min(maxC, c + 1); col++) {
        if (row === r && col === c) continue;
        if (board[row][col].value === -1) adjCount++;
      }
    }

    return adjCount;
  };

  render() {
    return (
      <div className="game_board">
        <div className="raised_board">
          <svg className="mine_count" height={50} width="95vw"></svg>
          <svg className="board_svg" height="60vh" width="95vw"></svg>
        </div>
      </div>
    );
  }
}

export default GameBoard;
