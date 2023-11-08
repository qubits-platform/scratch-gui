import React, { Component } from 'react';
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import parser from "html-react-parser";
import styles1 from "../components/gui/comment.css"
class CommentComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: false,
      content: '',
    };
  }

  deleteAPIcall = (dataid) => {
    // const url = "http://qubits.localhost.com/lib/ajax/service-react.php?sesskey=vTM5hHtphr&info=mod_qbassign_delete_comment";
    const url =  `${M.cfg.wwwroot}/lib/ajax/service.php?sesskey=${M.cfg.sesskey}&info=mod_qbassign_delete_comment`

    const payload = [
      {
        index: 0,
        methodname: "mod_qbassign_delete_comment",
        args: {
          commentid: dataid,
        },
      },
    ];

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        this.props.getAPI();
      })
      .catch((error) => {
        console.log("Error occured in Removing Comments");
      });
  };

 

  handleAccordionClick = () => {
    this.setState(prevState => ({
      expanded: !prevState.expanded,
    }));
  };

  render() {
    const { commentTotal, commentData, getAPI, comment, saveComment, commentContent } = this.props;
    const { expanded } = this.state;

   



    return (
       
      
      <div>
         {/* {(commentTotal >= 0) && ( */}
            
           
        <Accordion className={styles1.accordion} expanded={expanded}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            onClick={this.handleAccordionClick}
          >
            <Typography className={styles1.commentHeading}>
              Comments ({ commentTotal})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            { commentData?.map((item, i) => {


return (
  <div key={i} >
    {item.map((data, j) => {


              return (
                <div key={j} className="comment-card">
   
                        <Grid
                          container
                          spacing={2}
                          style={{
                            alignItems: "center",
                            justifyContent: "flex-start",
                            padding: "0 !important",
                          }}
                        >
                          <Grid item xs={1} className={styles1.p-0}>
                            <p className={styles1.shortnameProfile}>{data.shortname}</p>
                          </Grid>
                          <Grid item xs={2} className={styles1.p-0}>
                            <p className={styles1.fullname}>{data.fullname}</p>
                          </Grid>
                          <Grid item xs={4} className={styles1.p-0}>
                            <p>{data.time}</p>
                          </Grid>
                          <Grid item xs={1} className={styles1.p-0}>
                            {data.delete && (
                              <DeleteIcon
                                className={styles1.deleteIcon}
                                onClick={(e) => {
                                  this.deleteAPIcall(data.id);
                                }}
                              />
                            )}
                          </Grid>
                        </Grid>
                        <p style={{ width: "500px" }}>{parser(data.content)}</p>
                      
                        </div>
                  );
                })}
                
                  <TextareaAutosize
                    aria-label="empty textarea"
                    placeholder="Add comment"
                    minRows={3}
                    // onChange={(e) => {
                    //   // this.setState({ content: e.target.value });
                    //   commentContent()
                    // }}
                     onChange={
                      // this.setState({ content: e.target.value });
                      commentContent
                    }
                  />
                  <Stack direction="row" spacing={2}>
                    <Link
                      component="button"
                      underline="none"
                      variant="body2"
                      onClick={saveComment}
                    >
                      Save
                    </Link>
                    <Link
                      component="button"
                      underline="none"
                      variant="body2"
                      onClick={this.handleAccordionClick}
                    >
                      Cancel
                    </Link>
                  </Stack>
                </div>
              );
            })}
          </AccordionDetails>
        </Accordion>
       {/* )} */}
      </div>
    );
  }
}

export default CommentComponent;
