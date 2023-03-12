import { gridnum, ships } from "./util_functions.js"

export const generate_board = () =>{

    const boardstate = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ]

    const shipinfo = []

    for(let i=0;i<ships.length;i++){

        let ship_placed = false

        while(!ship_placed){

            let heading =  Math.floor(Math.random() * 2)

            //ramdom head coordinate
            let head_coordinate  = {
                x : Math.floor(Math.random() * gridnum),
                y : Math.floor(Math.random() * gridnum)
            }

            let tail_coordinate = {
                x : 0, y : 0
            }

            if(ships[i] === 1) heading = 1

            if(heading == 0){
                //create coordinate horizontal
                tail_coordinate.x = head_coordinate.x + ships[i] - 1
                tail_coordinate.y = head_coordinate.y            
            }
            else if(heading == 1){
                //create coordinate vertical
                tail_coordinate.x = head_coordinate.x
                tail_coordinate.y = head_coordinate.y + ships[i] - 1
            }

            //check if position is not place off board
            if( (tail_coordinate.x > (gridnum - 1)) || (tail_coordinate.y > (gridnum - 1)) ) continue
            
            //check if ship not overlap with others
            let valid = true
            if(heading === 0){
                //check coordinate horizontal
                for(let x = head_coordinate.x; x <= tail_coordinate.x ; x++){
                    if(boardstate[ head_coordinate.y ][ x ] !== 0) {
                        valid = false
                        break
                    }
                }
            }
            else if(heading === 1){
                //check coordinate vertical
                for(let y = head_coordinate.y; y <= tail_coordinate.y ; y++){
                    if(boardstate[ y ][ head_coordinate.x ] !== 0){
                        valid = false
                        break
                    }
                }
            }

            if(valid === false) continue

            if(heading === 0){
                //place ship horizontal
                for(let x = head_coordinate.x; x <= tail_coordinate.x ; x++){
                    boardstate[ tail_coordinate.y ][ x ] = i + 1      
                }

            }
            else if(heading === 1){
                //place ship vertical
                for(let y = head_coordinate.y; y <= tail_coordinate.y ; y++){
                    boardstate[ y ][ tail_coordinate.x ] = i + 1             
                }

            }
            
            //get ship info for place sprite in board
            shipinfo.push(
                {
                    name : get_name(ships[i]),
                    align : heading,
                    x : head_coordinate.x,
                    y : head_coordinate.y,
                    block : ships[i],
                    remainblock : ships[i]
                }
                
            )

            ship_placed = true

        }

    }

    return {
        ship : shipinfo,
        board : boardstate,
        remaining : 15
    }
}

export const get_name = (length) =>{
    if(length === 1) return "Fort"
    else if(length === 2) return "Gunboat"
    else if(length === 3) return "Cruiser"
    else if(length === 4) return "Battleship"
}