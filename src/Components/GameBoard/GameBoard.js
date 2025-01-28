import React, { Component } from "react";
import * as d3 from "d3";
import "./GameBoard.css"

class GameBoard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mines: this.props.mines,
    }
  }

  componentDidMount() {
    if (this.props.width !== null && this.props.height != null && this.props.mines != null) this.handleBoard();
  }

  componentDidUpdate(prevProps) {
    if(this.props.generated !== prevProps.generated) this.loadNewBoard();
    this.handleBoard();
  }

  loadNewBoard = () => {
    console.log("loadNew")
  }

  handleBoard = () => {
    console.log("Handle board")
  }

  handleLeftClick = (e) => {
    console.log(e.target)
    this.setState({mines: 12})
  }

  handleRightClick = (e) => {
    console.log(e.target);
    alert(123)
  }

  handleContextWindow = (e) => {
    e.preventDefault();
  }

  render() {
    return(
      <div className="game_board">
        <div className="raised_board">
          <svg className="mine_count" height={50} width="95vw"></svg>
          <svg className="board_svg" height="60vh" width="95vw"></svg>
        </div>
      </div>
    )
  }
}

export default GameBoard;