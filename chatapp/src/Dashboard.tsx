import React, { useEffect } from "react";
import {
    UserOutlined,
    DeleteOutlined,
    SendOutlined,
    PictureOutlined,
} from "@ant-design/icons";
import { MenuProps, Modal } from "antd";
import axios from "axios";
import Cookies from "universal-cookie";
import {
    Avatar,
    List,
    Layout,
    theme,
    Dropdown,
    message,
    Input,
    Button,
    Space,
    Row,
    Col,
} from "antd";

const cookies = new Cookies();

const host = "http://127.0.0.1:8000";
const data = [
    {
        title: "Orang 1",
    },
    {
        title: "Orang 2",
    },
    {
        title: "Orang 3",
    },
    {
        title: "Orang 4",
    },
];

const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    message.info("Click on left button.");
    console.log("click left button", e);
};

const { Header, Content, Footer, Sider } = Layout;

const Dashboard: React.FC = () => {
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const [recentMessageArr, setRecentMessageArr] = React.useState([]);
    const [isFirstLoad, setIsFirstLoad] = React.useState(true);
    const [chatArr, setChatArr] = React.useState([]);
    const [userId, setUserId] = React.useState(0);
    const [roomActiveId, setRoomActiveId] = React.useState(0);
    const [isModalProfileImageShow, setIsModalProfileImageShow] =
        React.useState(false);

    const handleMenuClick: MenuProps["onClick"] = (e) => {
        // message.info("Click on menu item.");
        if (e.key == 3) {
            cookies.remove("token_login");
            document.location.href = "/";
        } else if (e.key == 2) {
            setIsModalProfileImageShow(true);
        }
    };

    const items: MenuProps["items"] = [
        {
            label: (
                <Avatar
                    size={{
                        xs: 24,
                        sm: 32,
                        md: 40,
                        lg: 64,
                        xl: 80,
                        xxl: 100,
                    }}
                />
            ),
            key: "0",
        },
        {
            label: "Update Profile Picture",
            key: "1",
            icon: <UserOutlined />,
        },
        {
            label: "Chat Baru",
            key: "2",
            icon: <UserOutlined />,
        },
        {
            label: "Logout",
            key: "3",
            icon: <UserOutlined />,
            danger: true,
        },
    ];

    const menuProps = {
        items,
        onClick: handleMenuClick,
    };

    const recentMessage = (search = "") => {
        // useEffect(() => {
        setIsFirstLoad(false);
        const token = cookies.get("token_login");
        let url = "";
        if (search != "") {
            url = `${host}/api/recentmessage?token=${token}&search=${search}`;
        } else {
            url = `${host}/api/recentmessage?token=${token}`;
        }

        axios.get(url).then(function (result) {
            // console.log(result);
            setRecentMessageArr(result.data);
        });
        // });
    };
    if (isFirstLoad) {
        recentMessage();
    }

    const chatHistory = (room_id, el = "") => {
        // useEffect(() => {
        const token = cookies.get("token_login");

        document.querySelector("header").style.display = "block";
        document.querySelector("footer").style.display = "block";

        if (el != "") {
            const parent = el.target.closest("li");

            const srcImage = parent.querySelector(".avatar img").src;
            document.querySelector("header .avatar img").src = srcImage;

            const nama_kontak = parent.querySelector(".nama_kontak").innerHTML;
            document.querySelector("header .nama_kontak").innerHTML =
                nama_kontak;
        }

        setRoomActiveId(room_id);

        axios
            .get(`${host}/api/chathistory?token=${token}&room_id=${room_id}`)
            .then(function (result) {
                setChatArr(result.data.chats);
                setUserId(result.data.user_id);
                setTimeout(() => {
                    document.getElementById("input-chat").value = "";
                }, 500);
            });
        // });
    };

    const deleteChat = (chat_id, room_id) => {
        if (confirm("Hapus pesan ini ?")) {
            const token = cookies.get("token_login");
            const url = `${host}/api/hapus_pesan`;
            const data = {
                token: token,
                chat_id: chat_id,
            };

            axios.post(url, data).then(function (result) {
                let data = result.data;
                if (data.status == "success") {
                    chatHistory(room_id);
                } else {
                    message.error(data.message);
                }
            });
        }
    };

    const sendChat = () => {
        const chat = document.getElementById("input-chat").value;

        const token = cookies.get("token_login");
        const url = `${host}/api/kirim_pesan`;
        const data = {
            token: token,
            chat: chat,
            room_id: roomActiveId,
        };

        axios.post(url, data).then(function (result) {
            let data = result.data;
            if (data.status == "success") {
                chatHistory(roomActiveId);
                setTimeout(() => {
                    document.getElementById("input-chat").value = "";
                }, 500);
            } else {
                message.error(data.message);
            }
        });
    };

    const sendFile = () => {
        const file = document.getElementById("send-file").files[0];

        const token = cookies.get("token_login");
        const url = `${host}/api/kirim_file`;
        const data = {
            token: token,
            file: file,
            room_id: roomActiveId,
        };
        const config = {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            body: "binaryData",
        };

        axios.post(url, data, config).then(function (result) {
            let data = result.data;
            if (data.status == "success") {
                chatHistory(roomActiveId);
                setTimeout(() => {
                    document.getElementById("input-chat").value = "";
                }, 500);
            } else {
                message.error(data.message);
            }
        });
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider
                style={{ width: 1000 }}
                theme="light"
                // collapsible
                // collapsed={collapsed}
                // onCollapse={(value) => setCollapsed(value)}
            >
                <Layout style={{ padding: "16px" }}>
                    <Space.Compact style={{ width: "100%" }}>
                        <Input
                            defaultValue=" "
                            onKeyUp={(e) => {
                                recentMessage(e.target.value);
                            }}
                        />
                        <Dropdown menu={menuProps}>
                            <Button icon={<UserOutlined />} />
                        </Dropdown>
                    </Space.Compact>
                </Layout>
                <List
                    itemLayout="horizontal"
                    dataSource={recentMessageArr}
                    renderItem={(item, index) => (
                        <List.Item
                            data-id={item.room_id}
                            onClick={(e) => chatHistory(item.room_id, e)}
                            className="item_recent_message"
                        >
                            <List.Item.Meta
                                avatar={
                                    <Avatar
                                        className="avatar"
                                        src={item.profile_img}
                                    />
                                }
                                title={
                                    <div
                                        className="nama_kontak"
                                        style={{ textAlign: "left" }}
                                    >
                                        {item.nama_kontak}
                                    </div>
                                }
                                description={
                                    <div style={{ textAlign: "left" }}>
                                        {item.last_file != null &&
                                        item.last_chat == null ? (
                                            <span
                                                style={{ fontStyle: "italic" }}
                                            >
                                                file
                                            </span>
                                        ) : (
                                            <span>{item.last_chat}</span>
                                        )}
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
                {/* <Footer
                    style={{
                        position: "relative",
                        top: "35%",
                        // textAlign: "center",
                        width: "100%",
                    }}
                >
                    <Avatar
                        size={{
                            xs: 24,
                            sm: 32,
                            md: 40,
                            lg: 64,
                            xl: 80,
                            xxl: 100,
                        }}
                        icon={<UserOutlined />}
                    />
                </Footer> */}
            </Sider>
            <Layout>
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                        textAlign: "left",
                        paddingLeft: "20px",
                        display: "none",
                    }}
                >
                    <Avatar
                        className="avatar"
                        src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=1`}
                    />
                    <span
                        className="nama_kontak"
                        style={{
                            marginLeft: "10px",
                        }}
                    >
                        Orang
                    </span>
                </Header>
                <Content style={{ margin: "0 16px" }}>
                    {/* <div
                        style={{
                            padding: 24,
                            margin: "16px 0",
                            minHeight: 360,
                            background: colorBgContainer,
                        }}
                    >
                        <li>
                            <div>
                                <span></span>
                            </div>
                        </li>
                    </div> */}
                    {chatArr.map((chat, index) => {
                        return (
                            <div data-id={chat.chat_id}>
                                {chat.pengirim_id != userId ? (
                                    <Row>
                                        <Col
                                            span={20}
                                            style={{
                                                textAlign: "left",
                                                marginTop: 5,
                                                marginBottom: 5,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    padding: 10,
                                                    backgroundColor: "#eaeaea",
                                                    textAlign: "left",
                                                    borderRadius: 7,
                                                    display: "inline-block",
                                                    minWidth: 200,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display: "block",
                                                    }}
                                                >
                                                    {chat.file != null ? (
                                                        <img
                                                            src={chat.file}
                                                            alt=""
                                                            style={{
                                                                width: 200,
                                                                height: 200,
                                                                objectFit:
                                                                    "cover",
                                                                objectPosition:
                                                                    "center",
                                                            }}
                                                        />
                                                    ) : (
                                                        <span></span>
                                                    )}

                                                    {chat.isi != null ? (
                                                        <span
                                                            style={{
                                                                display:
                                                                    "block",
                                                            }}
                                                        >
                                                            {chat.isi}
                                                        </span>
                                                    ) : (
                                                        <span></span>
                                                    )}
                                                </span>
                                                <small
                                                    style={{
                                                        display: "block",
                                                        textAlign: "right",
                                                        marginRight: "10px",
                                                        marginTop: "5px",
                                                    }}
                                                >
                                                    {/* 27 Juli, 10:20 AM */}
                                                    {chat.date_created}
                                                </small>
                                            </div>
                                        </Col>
                                    </Row>
                                ) : (
                                    <Row>
                                        <Col
                                            offset={4}
                                            span={20}
                                            style={{
                                                textAlign: "right",
                                                marginTop: 5,
                                                marginBottom: 5,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    padding: 10,
                                                    backgroundColor: "#eaeaea",
                                                    textAlign: "left",
                                                    borderRadius: 7,
                                                    display: "inline-block",
                                                    minWidth: 200,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display: "block",
                                                    }}
                                                >
                                                    {chat.file != null ? (
                                                        <img
                                                            src={chat.file}
                                                            alt=""
                                                            style={{
                                                                width: 200,
                                                                height: 200,
                                                                objectFit:
                                                                    "cover",
                                                                objectPosition:
                                                                    "center",
                                                            }}
                                                        />
                                                    ) : (
                                                        <span></span>
                                                    )}

                                                    {chat.isi != null ? (
                                                        <span
                                                            style={{
                                                                display:
                                                                    "block",
                                                            }}
                                                        >
                                                            {chat.isi}
                                                        </span>
                                                    ) : (
                                                        <span></span>
                                                    )}
                                                </span>
                                                <small
                                                    style={{
                                                        display: "block",
                                                        textAlign: "right",
                                                        marginRight: "10px",
                                                        marginTop: "5px",
                                                    }}
                                                >
                                                    {chat.date_created}
                                                </small>
                                            </div>
                                            <Button
                                                icon={<DeleteOutlined />}
                                                onClick={() =>
                                                    deleteChat(
                                                        chat.chat_id,
                                                        chat.room_id
                                                    )
                                                }
                                            />
                                        </Col>
                                    </Row>
                                )}
                            </div>
                        );
                    })}
                </Content>
                <Footer style={{ textAlign: "center", display: "none" }}>
                    <Space.Compact style={{ width: "100%" }}>
                        <Input
                            placeholder="Ketik pesan"
                            id="input-chat"
                            onKeyUp={(e) => {
                                if (e.keyCode == 13) {
                                    document
                                        .getElementById("send-chat")
                                        .click();
                                }
                            }}
                        />
                        <Input
                            id="send-file"
                            type="file"
                            style={{ display: "none" }}
                            onChange={() => {
                                sendFile();
                            }}
                        />
                        <Button
                            icon={<PictureOutlined />}
                            onClick={() => {
                                document.getElementById("send-file").click();
                            }}
                        />
                        <Button
                            icon={<SendOutlined />}
                            id="send-chat"
                            onClick={() => {
                                sendChat();
                            }}
                        />
                    </Space.Compact>
                </Footer>
            </Layout>
            <Modal
                title="Chat Baru"
                open={isModalProfileImageShow}
                onOk={() => {
                    setIsModalProfileImageShow(false);
                }}
                onCancel={() => {
                    setIsModalProfileImageShow(false);
                }}
            >
                <Form></Form>
            </Modal>
        </Layout>
    );
};

export default Dashboard;
