Attribute VB_Name = "M_WinAPI"
Option Explicit

'==========================================================
' M_WinAPI
' Declaracoes de API do Windows usadas pelo Core (temporizacao
' sem depender de Application.Wait do Excel, que trava a UI).
' Compativel com Office 32 e 64 bits (VBA7 / PtrSafe).
'==========================================================

#If VBA7 Then
    Public Declare PtrSafe Sub Sleep Lib "kernel32" (ByVal dwMilliseconds As Long)
    Public Declare PtrSafe Function GetTickCount Lib "kernel32" () As Long
#Else
    Public Declare Sub Sleep Lib "kernel32" (ByVal dwMilliseconds As Long)
    Public Declare Function GetTickCount Lib "kernel32" () As Long
#End If
