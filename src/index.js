import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
//import packages and formatting from the css file

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    console.log("constructor created")
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      lastSquare: -1,
      occupiedCenter: false
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    
    if (calculateWinner(squares)) {
      return;
    }

    if (this.state.stepNumber < 6){
      console.log("under 6 moves"); 
      /*console.log(!squares[-1]);*/

      if (!squares[i]){ /*only place values in empty spaces*/
        squares[i] = this.state.xIsNext ? "X" : "O";
        /*if X is next, squares[i] = X. if not, O*/
        this.setState({
          history: history.concat([
            {
              squares: squares
            }
          ]),
          stepNumber: history.length,
          xIsNext: !this.state.xIsNext
        });
      }
    }
    
    else{

      console.log("over 6 moves");

      if (this.state.lastSquare < 0 && squares[i] && (squares[i] === (this.state.xIsNext ? 'X' : 'O'))){ 
        /*the last square does not exist and current square is occupied. Also must make sure only moving current player pieces
      this is the first part of the move. select the square you wish to move*/

        if (squares[4] && (squares[4] === (this.state.xIsNext ? 'X' : 'O'))){ 
          /*if center is occupied during that person's first half of turn, change state to true*/
          console.log("center square occupied");
          this.setState({
            occupiedCenter: true
          });
        }
        else{
          this.setState({
            occupiedCenter: false
          });
        }

        this.setState({
          history: history.concat([
            {
              squares: squares
            }
          ]),
          stepNumber: history.length,
          xIsNext: this.state.xIsNext,
          /*keep current turn. need to go again and move to a spot*/
          lastSquare: i
        });
        console.log(this.state.lastSquare);
        squares[i] = null; 
        return; 
      }
      

      if (moveAdjacent(i, this.state.lastSquare)){ /*check to see if the numbers match up. 
      Am i moving to current spot from valid place?*/
      
        if (!squares[i]){ /*new spot is empty*/
          squares[i] = this.state.xIsNext ? "X" : "O";
          this.setState({
            history: history.concat([
              {
                squares: squares
              }
            ]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
            /*end of turn. placed in new spot. reset values*/
            lastSquare: -1
          });

          /* if after the move there is a winner*/
          if (calculateWinner(squares)) {
            return;
          }
          
          /* if current player is occupying center and they were in the past as well*/
          if ((squares[4] === (this.state.xIsNext ? 'X' : 'O')) && this.state.occupiedCenter){
            /* revert to previous history and put error message*/ 
            console.log("move the center square");

            //this.jumpTo(history.length -1);
            this.setState({
              history: history.concat([
                {
                  squares: squares
                }
              ]),
              stepNumber: history.length,
              xIsNext: this.state.xIsNext,
              /*end of turn. placed in new spot. reset values*/
              lastSquare: -1
            });
            
            this.loadHis(this.state.stepNumber - 1);
          }

        }
      }
      

    }

  }

  loadHis(step){
    this.setState({
      stepNumber: step
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    //let error;

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function moveAdjacent(current, prev) {
  if (current === 0)
    return prev === 1 || prev === 3 || prev === 4;
  else if (current === 1)
    return prev === 0 || prev === 2 || prev === 4 || prev === 3 || prev === 5;
  else if (current === 2)
    return prev === 1 || prev === 4 || prev === 5;
  else if (current === 3)
    return prev === 0 || prev === 1 || prev === 4 || prev === 6 || prev === 7;
  else if (current === 4) 
    return prev !== 4;
  else if (current === 5)
    return prev === 1 || prev === 2 || prev === 4 || prev === 7 || prev === 8;
  else if (current === 6)
    return prev === 3 || prev === 4 || prev === 7;
  else if (current === 7)
    return prev === 3 || prev === 4 || prev === 5 || prev === 6 || prev === 8;
  else if (current === 8)
    return prev === 4 || prev === 5 || prev === 7;
}

