<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    // public function dashboard(){
    //     $user_login     = \DB::table("user")->where("user_id",\Auth::user()->user_id)->first();
    //     $users      = \DB::table("user")->where("user_id","!=",\Auth::user()->user_id)->get();

    //     $profile_img    = !empty($user_login->profile_img) ? "/uploads/".$user_login->profile_img : "https://bootdey.com/img/Content/avatar/avatar1.png";

    //     $data       = [
    //         "users"     => $users,
    //         "user_login"     => $user_login,
    //         "profile_img"     => $profile_img,
    //     ];
    //     return view("index",$data);
    // }
    public function recentmessage(Request $request){
        $user_login     = \Helper::getUserLogin($request->token);

        $search     = $request->search;

        $query     = \DB::table("room")
        ->select(
            "room.room_id",
            \DB::raw(" (SELECT username FROM user as user_tujuan 
                INNER JOIN user_room as user_room_tujuan 
                ON user_tujuan.user_id = user_room_tujuan.user_id
                WHERE user_tujuan.user_id != user_sql.user_id 
                AND user_room_tujuan.room_id = room.room_id
                LIMIT 1) as nama_kontak "),
            \DB::raw(" (SELECT profile_img FROM user as user_tujuan 
                INNER JOIN user_room as user_room_tujuan 
                ON user_tujuan.user_id = user_room_tujuan.user_id
                WHERE user_tujuan.user_id != user_sql.user_id 
                AND user_room_tujuan.room_id = room.room_id
                LIMIT 1) as profile_img "),
            \DB::raw(" (SELECT isi FROM chat WHERE chat.room_id = room.room_id ORDER BY chat_id DESC LIMIT 1) as last_chat "),
            \DB::raw(" (SELECT file FROM chat WHERE chat.room_id = room.room_id ORDER BY chat_id DESC LIMIT 1) as last_file "),
            \DB::raw(" (SELECT date_created FROM chat WHERE chat.room_id = room.room_id ORDER BY chat_id DESC LIMIT 1) as last_date_created ")
        )
        ->join("user_room as room_users_sql","room_users_sql.room_id","=","room.room_id")
        ->join("user as user_sql","room_users_sql.user_id","=","user_sql.user_id")
        ->where("room_users_sql.user_id",$user_login->user_id)
        ->where(\DB::raw("(SELECT chat.chat_id FROM chat WHERE chat.room_id = room.room_id ORDER BY chat_id DESC LIMIT 1)"),"!=","NULL")
        ->orderBy("last_date_created","DESC");

        if(!empty($search)){
            $query->where(\DB::raw("(SELECT username FROM user as user_tujuan 
            INNER JOIN user_room as user_room_tujuan 
            ON user_tujuan.user_id = user_room_tujuan.user_id
            WHERE user_tujuan.user_id != user_sql.user_id 
            AND user_room_tujuan.room_id = room.room_id
            LIMIT 1)"),'like',"%$search%");
        }

        $recent_message     = $query->get();


        foreach ($recent_message as $key => $rm) {
            $profile_img    = !empty($rm->profile_img) ? url("/uploads/".$rm->profile_img) : "https://bootdey.com/img/Content/avatar/avatar1.png";
            $recent_message[$key]->profile_img = $profile_img;
        }
        return response()->json($recent_message);
    }
    public function chathistory(Request $request){
        $user_login     = \Helper::getUserLogin($request->token);

        $room_id    = $request->room_id;

        $chats  = \DB::table("chat")->where("room_id",$room_id)->get();
        $user_id    = $user_login->user_id;

        foreach ($chats as $key => $chat) {
            $file    = !empty($chat->file) ? url("/uploads/".$chat->file) : null;
            $chats[$key]->file = $file;
        }

        $data   = [
            "chats"     => $chats,
            "user_id"     => $user_id,
        ];
        return response()->json($data);
    }
    function update_profile_img(Request $request) {
        $status     = "";
        $message     = "";

        $user_login     = \Helper::getUserLogin($request->token);


        $file = $request->file('file');
        $user_id    = $user_login->user_id;
        $path       = "uploads";

        $new_name   = "profile_img_".$user_id."_".time().".".$file->getClientOriginalExtension();
        $file->move($path,$new_name);

        $data_insert    = [
            "profile_img"   => $new_name,
        ];

        $insert     = \DB::table("user")->where("user_id",$user_id)->update($data_insert);
        if($insert){
            $status = "success";
            $message    = "Sukses";
        }else{
            $status     = "error";
            $message    = "Error!";
        }

        $return_arr = [
            "status"    => $status,
            "message"    => $message,
            "profile_img"   => $path."/".$new_name
        ];

        return response()->json($return_arr);
    }
}
