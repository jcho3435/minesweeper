import React, { Component } from "react";
import './GameSelection.css'

class GameSelection extends Component {
  constructor(props){
    super(props);

    this.state = {
      customW: 10,
      customH: 10,
      customMines: 10,
      selected: "easy",
      w: 10,
      h: 10,
      numMines: 10
    }
  }

  handleLabelClick = (e) => {
    if (e.target.htmlFor === this.state.selected) return;
    var difficultyMap = {
      easy: JSON.stringify({w: 10, h: 10, numMines: 10}),
      normal: JSON.stringify({w: 16, h: 16, numMines: 40}),
      advanced: JSON.stringify({w: 30, h: 16, numMines: 99}),
      custom: JSON.stringify({w: this.state.customW, h: this.state.customH, numMines: this.state.customMines})
    }
    e.target.name = e.target.htmlFor;
    e.target.value = difficultyMap[e.target.htmlFor];
    this.handleFormChange(e);
  }

  handleFormChange = (e) => {
    let value = JSON.parse(e.target.value);
    this.setState({selected: e.target.name, ...value});
  }

  handleGenerateClick = () => {
    var boardRules = {w: this.state.w, h: this.state.h, numMines: this.state.numMines};
    if (this.state.selected === "custom") {
      boardRules = {w: this.state.customW, h: this.state.customH, numMines: this.state.customMines};
    }
    this.props.setBoardRules(boardRules);
  }

  handleCustomGameField = (e) => {
    var value = e.target.value;
    if (value !== '') value = parseInt(value);

    var customH = this.state.customH !== '' ? this.state.customH : 0
    var customW = this.state.customW !== '' ? this.state.customW : 0
    var maxMap = {
      width: 200,
      height: 200,
      mines: customH * customW - 1
    };
    
    switch (e.target.name) {
      case "width":
        this.setState({customW: value > maxMap[e.target.name] ? maxMap[e.target.name] : value});
        break;
      case "height":
        this.setState({customH: value > maxMap[e.target.name] ? maxMap[e.target.name] : value});
        break;
      case "mines":
        this.setState({customMines: value > maxMap[e.target.name] ? maxMap[e.target.name] : value});
        break;
    }
  }

  render() {
    var customH = this.state.customH !== '' ? this.state.customH : 0
    var customW = this.state.customW !== '' ? this.state.customW : 0
    var maxMines = customH * customW - 1;
    return(
      <div className="form_div">
        <p className="game_selection_title">Select a board</p>
        <form className="game_selection_form" onChange={this.handleFormChange}>
          <input type="radio" name="easy" value={JSON.stringify({w: 10, h: 10, numMines: 10})} checked={this.state.selected === "easy"} readOnly></input><label htmlFor="easy" onClick={this.handleLabelClick}>Easy: 10x10, 10 mines</label><br />
          <input type="radio" name="normal" value={JSON.stringify({w: 16, h: 16, numMines: 40})} checked={this.state.selected === "normal"} readOnly></input><label htmlFor="normal" onClick={this.handleLabelClick}>Normal: 16x16, 40 mines</label><br />
          <input type="radio" name="advanced" value={JSON.stringify({w: 30, h: 16, numMines: 99})} checked={this.state.selected === "advanced"} readOnly></input><label htmlFor="advanced" onClick={this.handleLabelClick}>Advanced: 30x16, 99 mines</label><br />
          <input type="radio" name="custom" value={JSON.stringify({w: this.state.customW, h: this.state.customH, numMines: this.state.customMines})} checked={this.state.selected === "custom"} readOnly></input><label htmlFor="custom" onClick={this.handleLabelClick}>Custom game: </label>
        </form>
        <div className="custom_game_inputs" style={{marginLeft: '21px'}}>
          <label>Height</label><input type="number" value={this.state.customH > 200 ? 200 : this.state.customH} name="height" onInput={this.handleCustomGameField} min={1} max={200} style={{marginLeft: '5px', marginRight: '5px'}} id="height" />
          <label>Width</label><input type="number" value={this.state.customW > 200 ? 200: this.state.customW} name="width" onInput={this.handleCustomGameField} min={1} max={200} style={{marginLeft: '5px', marginRight: '5px'}} id="width" />
          <label>Mines (max {maxMines})</label><input type="number" value={this.state.customMines > maxMines ? maxMines : this.state.customMines} name="mines" onChange={this.handleCustomGameField} min={1} max={maxMines} style={{marginLeft: '5px'}} id="mines" /><br />
        </div>
        <button onClick={this.handleGenerateClick} style={{marginLeft: '21px'}}>Generate Game</button>
      </div>
    )
  }
}

export default GameSelection;