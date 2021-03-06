/**
 * Created by a1 on 2016/5/5.
 */

import React from 'react';
import ReactDOM from 'react-dom';

import { Modal, Form, Input, message, Row, Col } from 'antd';

import MenuComponent       from '../../components/menu/js/MenuComponent';
import SearchComponent     from '../../components/search/js/SearchComponent';
import ToolBarComponent    from '../../components/toolbar/js/ToolBarComponent';
import BreadcrumbComponent from '../../components/breadcrumb/js/BreadcrumbComponent';
import TableComponent      from '../../components/table/js/TableComponent';
import PaginationComponent from '../../components/pagination/js/PaginationComponent';
import fetchComponent      from '../../components/fetch/js/fetchComponent';


export default class EditUserPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			nowPage   : 1,              // 当前页ID
			pageSize  : 10,             // 当前页个数

			visible   : false,          // 弹出框是否显示
			mId       : "",             // 弹出框中的用户ID
			mName     : "",             // 弹出框中的用户名称
			mPassword : "",             // 弹出框中的用户密码
			mEmail    : "",             // 弹出框中的用户邮箱

			paginationDOM : null,
			tableDOM : null
		};

		this.paginationClick  = this.paginationClick.bind(this);
		this.operationClick   = this.operationClick.bind(this);
		this.handleOk         = this.handleOk.bind(this);
		this.handleCancel     = this.handleCancel.bind(this);

		this.mNameChange      = this.mNameChange.bind(this);
		this.mPasswordChange  = this.mPasswordChange.bind(this);
		this.mEmailChange     = this.mEmailChange.bind(this);
	}

	componentWillMount() {
		// 获取用户的总个数
		this.getUserCount();
	}


	// 设置state中和页面数据相关的值
	settingState(nowPage,
	             pageSize,
	             visible,
	             mId,
				 mName,
				 mPassword,
				 mEmail) {
		if(nowPage === "no") {
			nowPage = this.state.nowPage;
		}
		if(pageSize === "no") {
			pageSize = this.state.pageSize;
		}

		if(visible === "no") {
			visible = this.state.visible;
		}
		if(mId === "no") {
			mId = this.state.mId;
		}
		if(mName === "no") {
			mName = this.state.mName;
		}
		if(mPassword === "no") {
			mPassword = this.state.mPassword;
		}
		if(mEmail === "no") {
			mEmail = this.state.mEmail;
		}

		this.setState({
			nowPage          : nowPage,
			pageSize         : pageSize,

			visible          : visible,
			mId              : mId,
			mName            : mName,
			mPassword        : mPassword,
			mEmail           : mEmail
		});
	}

	/******************************事件响应方法--开始***********************************/

	// 翻页按钮点击
	paginationClick(nowPage){
		this.settingState(nowPage, "no", "no", "no", "no", "no", "no");
		// 根据当前分类加载第一页用户数据
		this.getUserList(nowPage);
	}

	// 操作列点击
	operationClick(index, item){
		const self = this;
		setTimeout(function(){
			self.settingState("no", "no", true, item.User_ID, "no", "no", "no");
			// 根据ID获取用户全部信息
			self.getUser(item.User_ID);
		}, 0);
	}

	// 弹出框确认点击
	handleOk(index, item){
		// 更新用户信息
		this.updateUser();
	}

	// 弹出框取消点击
	handleCancel(index, item){
		this.settingState("no", "no", false, "", "", "", "");
	}

	mNameChange(e) {
		const name = e.target.value;
		this.settingState("no", "no", "no", "no", name, "no", "no");
	}

	mPasswordChange(e) {
		const password = e.target.value;
		this.settingState("no", "no", "no", "no", "no", password, "no");
	}

	mEmailChange(e) {
		const email = e.target.value;
		this.settingState("no", "no", "no", "no", "no", "no", email);
	}


	/******************************事件响应方法--结束***********************************/

	// 获取用户列表
	getUserCount() {
		const url = "/doit/userAction/getUserCount";
		const method = "POST";
		const body = {};
		const errInfo = "请求用户个数连接出错！";
		fetchComponent.send(this, url, method, body, errInfo, this.requestCountCallback);
	}

	// 请求用户总个数的回调方法
	requestCountCallback(cbData) {

		if(cbData.success === "1"){
			// paginationDOM--因为ajax之后select的默认数据不会自动设置
			this.setState({
				paginationDOM : <PaginationComponent
					count={cbData.data}
					pageSize={this.state.pageSize}
					pageed={this.paginationClick}/>
			});

			// 根据当前分类加载第一页用户数据
			this.getUserList(1);
		}
	}

	// 根据当前分类加载第一页用户数据
	getUserList(nowPage) {
		const url = "/doit/userAction/getUserList";
		const method = "POST";
		const body = {
			"page" : nowPage,
			"size" : this.state.pageSize
		};
		const errInfo = "请求用户列表连接出错！";
		fetchComponent.send(this, url, method, body, errInfo, this.requestUserListCallback);
	}

	// 请求用户列表的回调方法
	requestUserListCallback(cbData) {

		if(cbData.success === "1"){
			// 组织表格数据
			this.dealTableData(cbData);
		}
	}

	// 组织表格数据
	dealTableData(cbData) {
		const totalWidth = document.getElementById("user_page").offsetWidth - 25;
		const idWidth        = totalWidth * 0.0749;
		const titleWidth     = totalWidth * 0.3537;
		const urlWidth       = totalWidth * 0.4705;
		const operationWidth = totalWidth * 0.0656;

		const self = this;
		let tableColumns = [
			{ title: 'ID', width: idWidth, dataIndex: 'User_ID', key: 'User_ID' },
			{ title: '名称', width: titleWidth, dataIndex: 'User_Account', key: 'User_Account' },
			{ title: '邮箱', width: urlWidth, dataIndex: 'User_Email', key: 'User_Email' },
			//, { title: '操作', width: operationWidth, dataIndex: '', key: 'operation', render: (index, item) => <a href='javascript:void(0)' onClick={self.openEditModel.bind(null, index, item)}>修改</a> },
		];

		// 设置表格操作列配置
		tableColumns.push({
			title: '操作',
			width: operationWidth,
			dataIndex: 'operation',
			key: 'operation',
			render(index, item) {
				return <a href='javascript:void(0)' onClick={self.operationClick.bind(null, index, item)}>修改</a>
			}
		});

		let tableData = [];
		for(let item of cbData.data){
			item.key = item.User_ID;
			tableData.push(item);
		}

		const expandedRowRender = record => <p>{record.User_Account}</p>;
		const scroll = { y: 380, x: totalWidth };

		this.setState({
			tableDOM : <TableComponent
				tableColumns={tableColumns}
				tableData={tableData}
				expandedRowRender={expandedRowRender}
				selectedRowKeys={false}
				rowSelection={null}
				checkboxSelected={false}
				scroll={scroll}/>
		});
	}

	// 根据ID获取用户全部信息
	getUser(id) {
		const url = "/doit/userAction/getUser";
		const method = "POST";
		const body = {
			"selectId" : id
		};
		const errInfo = "请求用户信息连接出错！";
		fetchComponent.send(this, url, method, body, errInfo, this.requestUserCallback);
	}

	// 请求用户信息回调方法
	requestUserCallback(cbData) {

		if(cbData.success === "1"){
			this.settingState("no", "no", "no", "no", cbData.name, "no", cbData.email);
		}
	}

	// 更新用户信息
	updateUser() {
		const url = "/doit/userAction/updateUser";
		const method = "POST";
		const body = {
			"id"       : this.state.mId,
			"name"     : encodeURI(encodeURI(this.state.mName)),
			"password" : encodeURI(encodeURI(this.state.mPassword)),
			"email"    : encodeURI(encodeURI(this.state.mEmail))
		};
		const errInfo = "更新用户信息连接出错！";
		fetchComponent.send(this, url, method, body, errInfo, this.requestUpdateCallback);
	}

	// 更新用户的回调方法
	requestUpdateCallback(cbData) {
		this.settingState("no", "no", false, "", "", "", "");
		if(cbData.success === "1") {
			// 重新获取当前页数据
			this.getUserList(this.state.nowPage);
			message.success(cbData.msg+"！", 3);
		} else {
			message.error(cbData.msg+"！", 3);
		}
	}

	render() {
		const FormItem = Form.Item;
		return (
			<div>
				<MenuComponent openSubMenu={this.props.route.sort} selectedMenu={this.props.route.bpath} />
				<div className="ant-layout-main">
					<div className="ant-layout-header">
						<Row>
							<Col span={4}>
								<SearchComponent
									placeholder="快速菜单入口"
									style={{ width: 230 }}
								/>
							</Col>
							<Col span={12} offset={8}>
								<ToolBarComponent
								/>
							</Col>
						</Row>
					</div>
					<div className="ant-layout-container">
						<div className="ant-layout-content">
							<BreadcrumbComponent
								data={this.props.routes}
							/>
							<div id="user_page" className="page edit-user-page">
								{this.state.tableDOM}
								{this.state.paginationDOM}
							</div>

							<Modal title="修改用户信息"
							       visible={this.state.visible}
							       onOk={this.handleOk}
							       onCancel={this.handleCancel}>
								<Form horizontal>
									<FormItem
										label="用户名称">
										<Input value={this.state.mName} onChange={this.mNameChange} placeholder="" size="large"/>
									</FormItem>
									<FormItem
										label="用户密码">
										<Input value={this.state.mPassword} onChange={this.mPasswordChange} placeholder="" size="large"/>
									</FormItem>
									<FormItem
										label="用户邮箱">
										<Input value={this.state.mEmail} onChange={this.mEmailChange} placeholder="" size="large"/>
									</FormItem>
								</Form>
							</Modal>
						</div>
					</div>
					<div className="ant-layout-footer">
						52DOIT 版权所有 © 2016 由不拽注定被甩~技术支持
					</div>
				</div>
			</div>
		);
	}
};





