import React, { Component } from "react";
import GameSelection from "../GameSelection/GameSelection";
import GameBoard from "../GameBoard/GameBoard";
import "./Parent.css"

class Parent extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      w: null,
      h: null,
      numMines: null,
      generated: 0
    }
  }

  componentDidUpdate () {
    console.log(this.state);
  }

  setBoardRules = (ruleDict) => {
    this.setState({...ruleDict, generated: this.state.generated+1});
  }

  render() {
    return(
      <div className="applicationParent">
        <GameSelection setBoardRules={this.setBoardRules} />
        <GameBoard width={this.state.w} height={this.state.h} mines={this.state.numMines} generated={this.state.generated} />
      </div>
    )
  }
}

export default Parent;