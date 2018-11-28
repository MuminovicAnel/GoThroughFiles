import React, { Component } from "react";
import StackGrid from "react-stack-grid";
import Card from "../components/card/index";
import Button from "../components/button";
import InputBar from "../components/inputBarSearch";
import Modal from "../components/modal";

const {ipcRenderer} = window.require('electron');

class Main extends Component {

    constructor(props){
        super(props);
        this.state={
            datas : null,
            search: "",
            modalOpened: false,
            marginHeight:"40vh",
            loading:false
        };
        this.searchStringChange = this.searchStringChange.bind(this);
        this.search = this.search.bind(this);
        this.modalToggle = this.modalToggle.bind(this);
        this.changePage = this.changePage.bind(this);

    }

    searchStringChange(e){
        this.setState({search : e.target.value});
    }

    modalToggle() {
        this.setState({modalOpened: !this.state.modalOpened});
    }

    search(){
        let that = this;
        if(this.state.search!=="" && this.state.search!==null){
            this.setState({loading: true});
            ipcRenderer.send('Search', this.state.search);

            ipcRenderer.once('returnSearch', function(event, response){
                setTimeout(()=>{
                    that.setState({datas:response, marginHeight:0, loading:false});
                    },1000)
            });
        }
    }

    changePage(){

    }

    render() {
        const coverClass = this.state.modalOpened ? 'modal-cover modal-cover-active' : 'modal-cover';
        const containerClass = this.state.modalOpened ? 'modal-container modal-container-active' : 'modal-container';
        return (
            <div style={{width:"75%",marginLeft:"auto",marginRight:"auto"}}>
                <div style={{position:"absolute",right:0,top:0}}>
                    <Button text={"réglage"} search={()=>this.props.goToPage("settings")}/>
                </div>

                <div style={{height:70,padding:25,marginTop:this.state.marginHeight,transition:"all 1s"}}>
                    <InputBar value={this.state.search} stringChange={this.searchStringChange} search={this.search} loading={this.state.loading}/>
                    {this.state.datas && ((this.state.datas.items).lenght + " trouvé")}
                </div>
                <div className={containerClass}>
                    <div className='modal-header'>
                        <h1></h1>
                    </div>
                    <div className='modal-body'>
                    </div>
                    <div className='modal-footer'></div>
                </div>
                <div className={coverClass} onClick={this.modalToggle}></div>
               
                <StackGrid
                    columnWidth={250}
                    gutterWidth={5}
                    >
                    {this.state.datas && this.state.datas.items.map((data,key)=>{
                        return <Card key={key} data={data} modal={this.modalToggle}/>
                    })}
                </StackGrid>
            </div>   
        );
    }
}

export default Main;
